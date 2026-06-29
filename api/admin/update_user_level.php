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

$stmt = $db->prepare("SELECT username, level, referred_by FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$db->beginTransaction();
try {
    // Update level — only use columns that exist
    $db->prepare("UPDATE users SET level = ? WHERE id = ?")
       ->execute([$newLevel, $userId]);

    // Update VIP using vip_expiry (real column)
    if ($isVip) {
        $db->prepare("UPDATE users SET is_vip = 1, vip_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?")
           ->execute([$userId]);
    } else {
        $db->prepare("UPDATE users SET is_vip = 0, vip_expiry = NULL WHERE id = ?")
           ->execute([$userId]);
    }

    // Credit referral commission if this user was referred and upgrading to paid level
    $levelPrices = [0 => 0, 1 => 1, 2 => 5, 3 => 10, 4 => 20];
    $upgradePrice = $levelPrices[$newLevel] ?? 0;

    if ($user['referred_by'] && $upgradePrice > 0) {
        $referrerId = (int)$user['referred_by'];
        $rStmt = $db->prepare("SELECT level, is_vip FROM users WHERE id = ?");
        $rStmt->execute([$referrerId]);
        $referrer = $rStmt->fetch(PDO::FETCH_ASSOC);

        if ($referrer) {
            $commRates  = [0 => 0, 1 => 20, 2 => 30, 3 => 40, 4 => 50];
            $rLevel     = (int)$referrer['level'];
            $rVip       = (int)$referrer['is_vip'];
            $commPct    = $rVip ? 60 : ($commRates[$rLevel] ?? 0);

            if ($commPct > 0) {
                $commAmount = round(($upgradePrice * $commPct) / 100, 2);

                // Credit referrer's wallet — only usd_balance exists
                $db->prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?")
                   ->execute([$commAmount, $referrerId]);

                // Log to referral_commissions if table exists
                try {
                    $db->prepare("
                        INSERT INTO referral_commissions (referrer_id, amount, created_at)
                        VALUES (?, ?, NOW())
                    ")->execute([$referrerId, $commAmount]);
                } catch (Exception $e) {}

                // Notification
                try {
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
                } catch (Exception $e) {}
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
