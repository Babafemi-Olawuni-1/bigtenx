<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// TEMP: Skip auth for testing
// require_once __DIR__ . '/middleware.php';
// requireAdmin();

$db = getDB();
$data = json_decode(file_get_contents('php://input'), true);

$userId = (int)($data['user_id'] ?? 0);
$newLevel = (int)($data['level'] ?? 0);
$isVip = (int)($data['is_vip'] ?? 0);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}

if ($newLevel < 0 || $newLevel > 4) {
    echo json_encode(['success' => false, 'message' => 'Level must be between 0 and 4']);
    exit;
}

// Get user
$stmt = $db->prepare("SELECT username, email FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

// Update level
$stmt = $db->prepare("UPDATE users SET level = ?, level_paid = 1 WHERE id = ?");
$stmt->execute([$newLevel, $userId]);

// Update VIP status
if ($isVip) {
    $db->prepare("UPDATE users SET is_vip = 1, vip_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?")->execute([$userId]);
} else {
    $db->prepare("UPDATE users SET is_vip = 0, vip_expiry = NULL WHERE id = ?")->execute([$userId]);
}

$levelNames = ['Free', 'Bronze', 'Silver', 'Gold', 'Diamond'];
$badge = $levelNames[$newLevel] ?? 'Free';

echo json_encode([
    'success' => true,
    'message' => "User {$user['username']} updated to {$badge} (Level {$newLevel})" . ($isVip ? " + VIP Bonus" : "")
]);