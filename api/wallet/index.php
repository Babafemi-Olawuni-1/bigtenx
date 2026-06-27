<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required"
    ]);
    exit;
}

try {
    $db = getDB();

    /*
    |--------------------------------------------------------------------------
    | Wallet data
    |--------------------------------------------------------------------------
    */
    $stmt = $db->prepare("
        SELECT usd_balance, coins, notifications
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$user_id]);

    $wallet = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$wallet) {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Highest owned badge
    |--------------------------------------------------------------------------
    */
    $stmt = $db->prepare("
        SELECT b.*
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = ?
        ORDER BY b.xp_multiplier DESC
        LIMIT 1
    ");
    $stmt->execute([$user_id]);

    $badge = $stmt->fetch(PDO::FETCH_ASSOC);

    $currentBadge = $badge['name'] ?? null;
    $currentMultiplier = isset($badge['xp_multiplier'])
        ? (float)$badge['xp_multiplier']
        : 1.0;

    /*
    |--------------------------------------------------------------------------
    | VIP status
    |--------------------------------------------------------------------------
    */
    $stmt = $db->prepare("
        SELECT expires_at
        FROM user_vip
        WHERE user_id = ?
          AND active = 1
          AND expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([$user_id]);

    $vip = $stmt->fetch(PDO::FETCH_ASSOC);

    $vipActive = false;
    $vipExpiresAt = null;

    if ($vip) {
        $vipActive = true;
        $vipExpiresAt = $vip['expires_at'];

        // VIP adds +20%
        $currentMultiplier = round($currentMultiplier * 1.2, 2);
    }

    echo json_encode([
        "success" => true,
        "wallet" => [
            "usd_balance" => round((float)$wallet['usd_balance'], 2),
            "coins" => round((float)$wallet['coins'], 2)
        ],
        "balance" => round((float)$wallet['usd_balance'], 2),
        "coins" => round((float)$wallet['coins'], 2),
        "notifications" => json_decode($wallet['notifications'] ?? '[]', true),
        "current_badge" => $currentBadge,
        "current_multiplier" => $currentMultiplier,
        "vip_active" => $vipActive,
        "vip_expires_at" => $vipExpiresAt
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>