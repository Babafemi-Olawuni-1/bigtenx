<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'POST required'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$upgradingUser = (int)($input['user_id'] ?? 0);
$upgradeAmount = (float)($input['upgrade_amount'] ?? 0);

if (!$upgradingUser || $upgradeAmount <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'user_id and upgrade_amount required'
    ]);
    exit;
}

$db = getDB();

/*
|--------------------------------------------------------------------------
| Get referrer
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT referred_by
    FROM users
    WHERE id = ?
");
$stmt->execute([$upgradingUser]);

$row = $stmt->fetch(PDO::FETCH_ASSOC);
$referrerId = $row ? (int)$row['referred_by'] : 0;

if (!$referrerId) {
    echo json_encode([
        'success' => true,
        'message' => 'No referrer found'
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Get highest badge
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT b.name, b.referral_percent
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
    ORDER BY b.referral_percent DESC
    LIMIT 1
");
$stmt->execute([$referrerId]);

$badge = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$badge) {
    echo json_encode([
        'success' => true,
        'message' => 'Referrer has no badge'
    ]);
    exit;
}

$commissionPct = (float)$badge['referral_percent'];
$badgeName = $badge['name'];

/*
|--------------------------------------------------------------------------
| VIP bonus (+10%)
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT id
    FROM user_vip
    WHERE user_id = ?
      AND active = 1
      AND expires_at > NOW()
    LIMIT 1
");
$stmt->execute([$referrerId]);

$isVip = (bool)$stmt->fetch();

if ($isVip) {
    $commissionPct += 10;
}

/*
|--------------------------------------------------------------------------
| Calculate commission
|--------------------------------------------------------------------------
*/
$commissionAmount = round(
    ($upgradeAmount * $commissionPct) / 100,
    2
);

$db->beginTransaction();

try {
    /*
    |--------------------------------------------------------------------------
    | Credit wallet
    |--------------------------------------------------------------------------
    */
    $db->prepare("
        UPDATE users
        SET usd_balance = usd_balance + ?,
            referral_earnings = referral_earnings + ?
        WHERE id = ?
    ")->execute([
        $commissionAmount,
        $commissionAmount,
        $referrerId
    ]);

    /*
    |--------------------------------------------------------------------------
    | Log commission
    |--------------------------------------------------------------------------
    */
    $db->prepare("
        INSERT INTO referral_commissions
        (
            referrer_id,
            referred_user_id,
            amount,
            commission_percentage,
            referrer_plan_at_time,
            referred_upgrade_amount,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ")->execute([
        $referrerId,
        $upgradingUser,
        $commissionAmount,
        $commissionPct,
        $isVip ? "{$badgeName} + VIP" : $badgeName,
        $upgradeAmount
    ]);

    /*
    |--------------------------------------------------------------------------
    | Notification
    |--------------------------------------------------------------------------
    */
    $stmt = $db->prepare("
        SELECT notifications
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$referrerId]);

    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

    $notifications = json_decode(
        $userRow['notifications'] ?? '[]',
        true
    ) ?: [];

    $notifications[] = [
        'id' => uniqid(),
        'type' => 'referral',
        'message' => "Referral bonus +\${$commissionAmount} ({$commissionPct}%)",
        'time' => date('Y-m-d H:i:s'),
        'read' => false
    ];

    $db->prepare("
        UPDATE users
        SET notifications = ?
        WHERE id = ?
    ")->execute([
        json_encode($notifications),
        $referrerId
    ]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'commission_amount' => $commissionAmount,
        'commission_pct' => $commissionPct,
        'referrer_id' => $referrerId
    ]);

} catch (Exception $e) {
    $db->rollBack();

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}