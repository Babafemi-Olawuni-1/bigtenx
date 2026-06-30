<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) { echo json_encode(["success" => false, "message" => "User ID is required"]); exit; }

try {
    $db = getDB();

    $stmt = $db->prepare("
        SELECT usd_balance, coins, notifications,
               COALESCE(deposit_status, 1)  AS deposit_status,
               COALESCE(withdraw_status, 1) AS withdraw_status,
               COALESCE(account_status, 1)  AS account_status
        FROM users WHERE id = ? LIMIT 1
    ");
    $stmt->execute([$user_id]);
    $wallet = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$wallet) { echo json_encode(["success" => false, "message" => "User not found"]); exit; }

    // Highest owned badge
    $badge = null;
    try {
        $bs = $db->prepare("SELECT b.* FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ? ORDER BY b.xp_multiplier DESC LIMIT 1");
        $bs->execute([$user_id]);
        $badge = $bs->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {}

    $currentBadge      = $badge['name'] ?? null;
    $currentMultiplier = isset($badge['xp_multiplier']) ? (float)$badge['xp_multiplier'] : 1.0;

    // VIP status
    $vipActive    = false;
    $vipExpiresAt = null;
    $vipAutoRenew = false;
    try {
        $vs = $db->prepare("SELECT expires_at, COALESCE(auto_renew,0) AS auto_renew FROM user_vip WHERE user_id = ? AND active = 1 AND expires_at > NOW() LIMIT 1");
        $vs->execute([$user_id]);
        $vip = $vs->fetch(PDO::FETCH_ASSOC);
        if ($vip) {
            $vipActive      = true;
            $vipExpiresAt   = $vip['expires_at'];
            $vipAutoRenew   = (bool)$vip['auto_renew'];
            $currentMultiplier = round($currentMultiplier * 1.2, 2);
        }
    } catch (Exception $e) {}

    echo json_encode([
        "success"            => true,
        "wallet"             => [
            "usd_balance"    => round((float)$wallet['usd_balance'], 2),
            "coins"          => (int)$wallet['coins'],
            "deposit_status" => (int)$wallet['deposit_status'],
            "withdraw_status"=> (int)$wallet['withdraw_status'],
            "account_status" => (int)$wallet['account_status'],
        ],
        "balance"            => round((float)$wallet['usd_balance'], 2),
        "coins"              => (int)$wallet['coins'],
        "deposit_status"     => (int)$wallet['deposit_status'],
        "withdraw_status"    => (int)$wallet['withdraw_status'],
        "account_status"     => (int)$wallet['account_status'],
        "notifications"      => json_decode($wallet['notifications'] ?? '[]', true),
        "current_badge"      => $currentBadge,
        "current_multiplier" => $currentMultiplier,
        "vip_active"         => $vipActive,
        "vip_expires_at"     => $vipExpiresAt,
        "vip_auto_renew"     => $vipAutoRenew,
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
