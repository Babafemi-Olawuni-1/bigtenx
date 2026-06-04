<?php
// Called when a user upgrades — credits commission to their referrer
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

$input         = json_decode(file_get_contents('php://input'), true);
$upgradingUser = (int)($input['user_id']        ?? 0);  // the user who just paid
$upgradeAmount = (float)($input['upgrade_amount'] ?? 0); // e.g. 10.00 for Gold

if (!$upgradingUser || $upgradeAmount <= 0) {
    echo json_encode(['success' => false, 'message' => 'user_id and upgrade_amount required']);
    exit;
}

$db = getDB();

// Who referred this user?
$stmt = $db->prepare("SELECT referred_by FROM users WHERE id = ?");
$stmt->execute([$upgradingUser]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$referrerId = $row ? (int)$row['referred_by'] : 0;

if (!$referrerId) {
    echo json_encode(['success' => true, 'message' => 'No referrer — nothing to do']);
    exit;
}

// Get referrer's current plan to determine commission %
$stmt = $db->prepare("SELECT level, is_vip, username FROM users WHERE id = ?");
$stmt->execute([$referrerId]);
$referrer = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$referrer) {
    echo json_encode(['success' => false, 'message' => 'Referrer not found']);
    exit;
}

// Commission rates: Level 0=0%, 1=20%, 2=30%, 3=40%, 4=50%, VIP=60%
$commissionRates = [0 => 0, 1 => 20, 2 => 30, 3 => 40, 4 => 50];
$level           = (int)$referrer['level'];
$isVip           = (int)$referrer['is_vip'];
$commissionPct   = $isVip ? 60 : ($commissionRates[$level] ?? 0);

if ($commissionPct === 0) {
    echo json_encode(['success' => true, 'message' => 'Referrer has no active plan — no commission']);
    exit;
}

$commissionAmount = round(($upgradeAmount * $commissionPct) / 100, 2);

$db->beginTransaction();
try {
    // Credit referrer's USD balance and referral_earnings
    $db->prepare("
        UPDATE users
        SET usd_balance       = usd_balance + ?,
            referral_earnings = referral_earnings + ?
        WHERE id = ?
    ")->execute([$commissionAmount, $commissionAmount, $referrerId]);

    // Record in commission log
    $db->prepare("
        INSERT INTO referral_commissions
            (referrer_id, referred_user_id, amount, commission_percentage,
             referrer_plan_at_time, referred_upgrade_amount, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ")->execute([
        $referrerId, $upgradingUser, $commissionAmount, $commissionPct,
        $isVip ? 'VIP' : ('Level ' . $level),
        $upgradeAmount,
    ]);

    // Notification for referrer
    $stmt = $db->prepare("SELECT notifications FROM users WHERE id = ?");
    $stmt->execute([$referrerId]);
    $rRow    = $stmt->fetch(PDO::FETCH_ASSOC);
    $notifs  = json_decode($rRow['notifications'] ?? '[]', true) ?: [];
    $notifs[] = [
        'id'      => uniqid(),
        'type'    => 'referral',
        'message' => "💰 Referral commission +\${$commissionAmount} ({$commissionPct}%) earned!",
        'time'    => date('Y-m-d H:i:s'),
        'read'    => false,
    ];
    $db->prepare("UPDATE users SET notifications = ? WHERE id = ?")
       ->execute([json_encode($notifs), $referrerId]);

    $db->commit();

    echo json_encode([
        'success'           => true,
        'commission_amount' => $commissionAmount,
        'commission_pct'    => $commissionPct,
        'referrer_id'       => $referrerId,
    ]);
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Commission failed: ' . $e->getMessage()]);
}
