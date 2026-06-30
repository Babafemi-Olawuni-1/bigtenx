<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$input     = json_decode(file_get_contents('php://input'), true);
$userId    = (int)($input['user_id']   ?? 0);
$weekDay   = (int)($input['week_day']  ?? -1);   // 0 Sun – 6 Sat
$weekStart = trim($input['week_start'] ?? '');    // ISO date of week's Sunday

if (!$userId || $weekDay < 0 || $weekDay > 6 || !$weekStart) {
    echo json_encode(['success' => false, 'message' => 'user_id, week_day and week_start required']);
    exit;
}

$db = getDB();

// Ensure weekly columns exist (safe alter)
foreach ([
    "ALTER TABLE users ADD COLUMN weekly_claimed_days TEXT NULL",
    "ALTER TABLE users ADD COLUMN weekly_start DATE NULL",
] as $sql) {
    try { $db->exec($sql); } catch (Exception $e) {}
}

// Fetch user
$stmt = $db->prepare("SELECT coins, weekly_claimed_days, weekly_start, streak FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { echo json_encode(['success' => false, 'message' => 'User not found']); exit; }

// Determine claimed days for this week
$storedStart   = $user['weekly_start'] ?? '';
$storedClaimed = $user['weekly_claimed_days'] ?? '';

$claimedDays = ($storedStart === $weekStart && $storedClaimed !== '')
    ? array_map('intval', explode(',', $storedClaimed))
    : [];

// Reject if already claimed today
if (in_array($weekDay, $claimedDays)) {
    echo json_encode(['success' => false, 'message' => 'Already claimed today']); exit;
}

// Admin-configurable rewards (fallback to hardcoded defaults)
$dailyXP = 3;
$bonusXP = 4;
try {
    $cfg = $db->query("SELECT `key`, `value` FROM admin_settings WHERE `key` IN ('weekly_daily_xp','weekly_bonus_xp')")->fetchAll(PDO::FETCH_KEY_PAIR);
    if (!empty($cfg['weekly_daily_xp'])) $dailyXP = (int)$cfg['weekly_daily_xp'];
    if (!empty($cfg['weekly_bonus_xp'])) $bonusXP = (int)$cfg['weekly_bonus_xp'];
} catch (Exception $e) {}

// Add today
$claimedDays[] = $weekDay;
$claimedDays   = array_unique($claimedDays);
sort($claimedDays);

$weekComplete   = count($claimedDays) === 7;
$coinsEarned    = $dailyXP + ($weekComplete ? $bonusXP : 0);
$newClaimed     = implode(',', $claimedDays);
$newStreak      = ((int)($user['streak'] ?? 0)) + 1;

$db->prepare("UPDATE users SET coins = coins + ?, weekly_claimed_days = ?, weekly_start = ?, streak = ? WHERE id = ?")
   ->execute([$coinsEarned, $newClaimed, $weekStart, $newStreak, $userId]);

$newCoins = (int)$user['coins'] + $coinsEarned;

echo json_encode([
    'success'       => true,
    'coins_earned'  => $coinsEarned,
    'new_coins'     => $newCoins,
    'claimed_days'  => $claimedDays,
    'week_complete' => $weekComplete,
    'streak_count'  => $newStreak,
]);
?>
