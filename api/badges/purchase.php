<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$userId  = (int)($input['user_id'] ?? 0);
$badgeId = (int)($input['badge_id'] ?? 0);

if (!$userId || !$badgeId) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID and Badge ID required'
    ]);
    exit;
}

$db = getDB();

try {
    // Get badge
    $stmt = $db->prepare("SELECT * FROM badges WHERE id = ? AND active = 1 LIMIT 1");
    $stmt->execute([$badgeId]);
    $badge = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$badge) {
        echo json_encode([
            'success' => false,
            'message' => 'Badge not found'
        ]);
        exit;
    }

    // Check if already owned
    $stmt = $db->prepare("
        SELECT id FROM user_badges
        WHERE user_id = ? AND badge_id = ?
    ");
    $stmt->execute([$userId, $badgeId]);

    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Badge already owned'
        ]);
        exit;
    }

    // Get user balance
    $stmt = $db->prepare("
        SELECT usd_balance, notifications
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    if ((float)$user['usd_balance'] < (float)$badge['price']) {
        echo json_encode([
            'success' => false,
            'message' => 'Insufficient balance. Fund wallet first.'
        ]);
        exit;
    }

    $db->beginTransaction();

    // Deduct wallet
    $db->prepare("
        UPDATE users
        SET usd_balance = usd_balance - ?
        WHERE id = ?
    ")->execute([$badge['price'], $userId]);

    // Assign badge
    $db->prepare("
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (?, ?)
    ")->execute([$userId, $badgeId]);

    // Auto VIP for Diamond
    if (strtolower($badge['name']) === 'diamond' && (int)$badge['vip_days'] > 0) {
        $expires = date('Y-m-d H:i:s', strtotime("+{$badge['vip_days']} days"));

        $db->prepare("
            INSERT INTO user_vip (user_id, expires_at, active)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE
            expires_at = ?, active = 1
        ")->execute([$userId, $expires, $expires]);
    }

    // Transaction history
    $db->prepare("
        INSERT INTO transactions
        (user_id, type, amount, status, created_at)
        VALUES (?, 'badge_purchase', ?, 'completed', NOW())
    ")->execute([$userId, $badge['price']]);

    // Notification
    $notifs = json_decode($user['notifications'] ?? '[]', true) ?: [];
    $notifs[] = [
        'id' => uniqid(),
        'type' => 'badge',
        'message' => "Badge purchased: {$badge['name']}",
        'time' => date('Y-m-d H:i:s'),
        'read' => false
    ];

    $db->prepare("
        UPDATE users
        SET notifications = ?
        WHERE id = ?
    ")->execute([json_encode($notifs), $userId]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => "{$badge['name']} badge purchased successfully",
        'badge' => $badge['name']
    ]);

} catch (Exception $e) {
    $db->rollBack();

    echo json_encode([
        'success' => false,
        'message' => 'Purchase failed: ' . $e->getMessage()
    ]);
}
?>