<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db   = getDB();
$data = json_decode(file_get_contents('php://input'), true);

$userId   = (int)($data['user_id'] ?? 0);
$newLevel = (int)($data['level']   ?? 0);
$isVip    = (int)($data['is_vip']  ?? 0);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}
if ($newLevel < 0 || $newLevel > 4) {
    echo json_encode(['success' => false, 'message' => 'Level must be 0–4']);
    exit;
}

$stmt = $db->prepare("SELECT username, email, level, referred_by FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$levelPrices = [0 => 0, 1 => 1, 2 => 5, 3 => 10, 4 => 20];
$upgradePrice = $levelPrices[$newLevel] ?? 0;

$db->beginTransaction();
try {
    // Update level
    $db->prepare("UPDATE users SET level = ?, level_paid = 1, level_expires = DATE_ADD(NOW(), INTERVAL 1 MONTH) WHERE id = ?")
       ->execute([$newLevel, $userId]);

    // Update VIP
    if ($isVip) {
        $db->prepare("UPDATE users SET is_vip = 1, vip_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?")
           ->execute([$userId]);
    } else {
        $db->prepare("UPDATE users SET is_vip = 0, vip_expiry = NULL WHERE id = ?")
           ->execute([$userId]);
    }

    // Credit referral commission if this user was referred and is upgrading to a paid level
    if ($user['referred_by'] && $upgradePrice > 0) {
        $referrerId = (int)$user['referred_by'];

        // Get referrer's current plan
        $rStmt = $db->prepare("SELECT level, is_vip FROM users WHERE id = ?");
        $rStmt->execute([$referrerId]);
        $referrer = $rStmt->fetch(PDO::FETCH_ASSOC);

        if ($referrer) {
            $commRates = [0 => 0, 1 => 20, 2 => 30, 3 => 40, 4 => 50];
            $rLevel    = (int)$referrer['level'];
            $rVip      = (int)$referrer['is_vip'];
            $commPct   = $rVip ? 60 : ($commRates[$rLevel] ?? 0);

            if ($commPct > 0) {
                $commAmount = round(($upgradePrice * $commPct) / 100, 2);

                $db->prepare("
                    UPDATE users
                    SET usd_balance       = usd_balance + ?,
                        referral_earnings = referral_earnings + ?
                    WHERE id = ?
                ")->execute([$commAmount, $commAmount, $referrerId]);

                $db->prepare("
                    INSERT INTO referral_commissions
                        (referrer_id, referred_user_id, amount, commission_percentage,
                         referrer_plan_at_time, referred_upgrade_amount, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW())
                ")->execute([
                    $referrerId, $userId, $commAmount, $commPct,
                    $rVip ? 'VIP' : ('Level ' . $rLevel),
                    $upgradePrice,
                ]);

                // Notification to referrer
                $nStmt = $db->prepare("SELECT notifications FROM users WHERE id = ?");
                $nStmt->execute([$referrerId]);
                $nRow   = $nStmt->fetch(PDO::FETCH_ASSOC);
                $notifs = json_decode($nRow['notifications'] ?? '[]', true) ?: [];
                $notifs[] = [
                    'id'      => uniqid(),
                    'type'    => 'referral',
                    'message' => "💰 Referral commission +\${$commAmount} ({$commPct}%) earned!",
                    'time'    => date('Y-m-d H:i:s'),
                    'read'    => false,
                ];
                $db->prepare("UPDATE users SET notifications = ? WHERE id = ?")
                   ->execute([json_encode($notifs), $referrerId]);
            }
        }
    }

    $db->commit();

    $levelNames = ['Free', 'Bronze', 'Silver', 'Gold', 'Diamond'];
    $badge = $levelNames[$newLevel] ?? 'Free';

    echo json_encode([
        'success' => true,
        'message' => "User {$user['username']} upgraded to {$badge} (Level {$newLevel})" . ($isVip ? ' + VIP' : ''),
    ]);
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()]);
}
