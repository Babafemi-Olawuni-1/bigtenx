<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;

$input = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);

if (!$userId) exit;

$db = getDB();

$stmt = $db->prepare("SELECT streak_month, streak_last_claim FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

$today = date('Y-m-d');
$lastClaim = $user['streak_last_claim'];
$streakDay = (int)($user['streak_month'] ?? 0);

// Reset if new month
if ($lastClaim && date('m', strtotime($lastClaim)) != date('m')) {
    $streakDay = 0;
}

if ($lastClaim === $today) {
    echo json_encode(['success' => false, 'message' => 'Already claimed']);
    exit;
}

// Check consecutive day
$yesterday = date('Y-m-d', strtotime('-1 day'));
if ($lastClaim === $yesterday) {
    $streakDay++;
} else {
    $streakDay = 1;
}

// REWARD FORMULA: 2 + streak (Day 1 = 3 XP)
$coinsEarned = 2 + $streakDay;

$db->prepare("UPDATE users SET coins = coins + ?, streak_month = ?, streak_last_claim = ? WHERE id = ?")
   ->execute([$coinsEarned, $streakDay, $today, $userId]);

echo json_encode([
    'success' => true,
    'coins_earned' => $coinsEarned,
    'streak_day' => $streakDay,
    'new_coins' => $coinsEarned
]);