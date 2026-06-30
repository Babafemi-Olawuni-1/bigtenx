<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input  = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);
$code   = strtoupper(trim($input['code'] ?? ''));

if (!$userId || !$code) {
    echo json_encode(['success' => false, 'message' => 'User ID and code required']);
    exit;
}

$db = getDB();

/*
|--------------------------------------------------------------------------
| Find task
|--------------------------------------------------------------------------
*/
$task = null;
$codeSource = 'universal';

$stmt = $db->prepare("SELECT * FROM admin_tasks WHERE verify_code = ? AND active = 1 LIMIT 1");
$stmt->execute([$code]);
$task = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$task) {
    try {
        $stmt = $db->prepare("
            SELECT at.*, tc.id AS tc_id
            FROM task_codes tc
            JOIN admin_tasks at ON at.id = tc.task_id
            WHERE tc.code = ?
              AND tc.used_by IS NULL
              AND at.active = 1
            LIMIT 1
        ");
        $stmt->execute([$code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            unset($row['tc_id']);
            $task = $row;
            $codeSource = 'individual';
        }
    } catch (Exception $e) {}
}

if (!$task) {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired code']);
    exit;
}

/*
|--------------------------------------------------------------------------
| Already completed?
|--------------------------------------------------------------------------
*/
if ($task['type'] === 'daily') {
    $stmt = $db->prepare("
        SELECT id FROM task_completions
        WHERE user_id = ?
        AND task_id = ?
        AND DATE(completed_at) = CURDATE()
    ");
} else {
    $stmt = $db->prepare("
        SELECT id FROM task_completions
        WHERE user_id = ?
        AND task_id = ?
    ");
}

$stmt->execute([$userId, $task['id']]);

if ($stmt->fetch()) {
    echo json_encode([
        'success' => false,
        'message' => $task['type'] === 'daily'
            ? 'You already completed this task today'
            : 'Task already completed'
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Hot offer checks
|--------------------------------------------------------------------------
*/
if ($task['type'] === 'hot') {
    if (!empty($task['max_users'])) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM task_completions WHERE task_id = ?");
        $stmt->execute([$task['id']]);

        if ((int)$stmt->fetchColumn() >= (int)$task['max_users']) {
            echo json_encode([
                'success' => false,
                'message' => 'This offer has reached its maximum participants'
            ]);
            exit;
        }
    }

    if (!empty($task['expires_at']) && strtotime($task['expires_at']) < time()) {
        echo json_encode([
            'success' => false,
            'message' => 'This offer has expired'
        ]);
        exit;
    }
}

/*
|--------------------------------------------------------------------------
| Fetch user
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT coins, usd_balance, today_earnings, today_earnings_date, notifications
    FROM users
    WHERE id = ?
");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

/*
|--------------------------------------------------------------------------
| Get highest badge multiplier
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT MAX(b.xp_multiplier) as highest_multiplier
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
");
$stmt->execute([$userId]);
$badgeData = $stmt->fetch(PDO::FETCH_ASSOC);

$multiplier = (float)($badgeData['highest_multiplier'] ?? 1.0);
if ($multiplier <= 0) $multiplier = 1.0;

/*
|--------------------------------------------------------------------------
| VIP bonus
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
$stmt->execute([$userId]);
$isVip = (bool)$stmt->fetch();

if ($isVip) {
    // VIP active, boost will be applied only to XP calculation
}

/*
|--------------------------------------------------------------------------
| Reward calculation — multiplier only applies when task has apply_multiplier=1
| VIP = +20% boost on top of badge multiplier (badge × 1.2)
| Multiplier does NOT affect signup bonus or weekly login reward
|--------------------------------------------------------------------------
*/
$baseReward = (float)$task['reward_xp'];
$rewardType = $task['reward_type'] ?? 'xp';
$applyMult  = (int)($task['apply_multiplier'] ?? 1);

if ($rewardType === 'xp') {
    $badgeMultiplier = (float)($badgeData['highest_multiplier'] ?? 1.0);
    if ($badgeMultiplier <= 0) $badgeMultiplier = 1.0;

    // Only apply multiplier when task opts in
    $effectiveMultiplier = $applyMult ? $badgeMultiplier : 1.0;
    // VIP boost: badge × 1.2 (applied on top of badge base)
    $vipBoost    = ($isVip && $applyMult) ? 1.2 : 1.0;
    $finalReward = round($baseReward * $effectiveMultiplier * $vipBoost, 2);
} else {
    // Cash rewards are always exact — no multiplier
    $finalReward = round($baseReward, 2);
}

/*
|--------------------------------------------------------------------------
| Today earnings
|--------------------------------------------------------------------------
*/
$today = date('Y-m-d');
$currentToday = ($user['today_earnings_date'] === $today)
    ? (float)$user['today_earnings']
    : 0;

$newTodayEarnings = $currentToday + $finalReward;

/*
|--------------------------------------------------------------------------
| Daily XP cap
|--------------------------------------------------------------------------
*/
$dailyCap = 100;

if ($rewardType === 'xp' && $newTodayEarnings > $dailyCap) {
    echo json_encode([
        'success' => false,
        'message' => "Daily XP limit reached. Maximum is {$dailyCap} XP per day."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Transaction
|--------------------------------------------------------------------------
*/
$db->beginTransaction();

try {
    $db->prepare("
        INSERT INTO task_completions (user_id, task_id, code_used, completed_at)
        VALUES (?, ?, ?, NOW())
    ")->execute([$userId, $task['id'], $code]);

    if ($codeSource === 'individual') {
        $db->prepare("
            UPDATE task_codes
            SET used_by = ?, used_at = NOW()
            WHERE task_id = ? AND code = ? AND used_by IS NULL
        ")->execute([$userId, $task['id'], $code]);
    }

    if ($rewardType === 'cash') {
        $db->prepare("
            UPDATE users
            SET usd_balance = usd_balance + ?,
                today_earnings = ?,
                today_earnings_date = ?
            WHERE id = ?
        ")->execute([$finalReward, $newTodayEarnings, $today, $userId]);

        $newCash = round((float)$user['usd_balance'] + $finalReward, 2);
        $newCoins = (float)$user['coins'];
    } else {
        $db->prepare("
            UPDATE users
            SET coins = coins + ?,
                today_earnings = ?,
                today_earnings_date = ?
            WHERE id = ?
        ")->execute([$finalReward, $newTodayEarnings, $today, $userId]);

        $newCoins = round((float)$user['coins'] + $finalReward, 2);
        $newCash = round((float)$user['usd_balance'], 2);
    }

    $notifs = json_decode($user['notifications'] ?? '[]', true) ?: [];
    $notifs[] = [
        'id' => uniqid(),
        'type' => 'task',
        'message' => "Task '{$task['title']}' completed! +" .
            ($rewardType === 'cash' ? "\${$finalReward}" : "{$finalReward} XP"),
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
        'message' => 'Task completed successfully',
        'reward_type' => $rewardType,
        'amount_earned' => $finalReward,
        'new_coins' => $newCoins,
        'new_usd_balance' => $newCash,
        'today_earnings' => $newTodayEarnings,
        'multiplier' => $multiplier,
        'vip_bonus' => $isVip
    ]);

} catch (Exception $e) {
    $db->rollBack();

    echo json_encode([
        'success' => false,
        'message' => 'Error processing reward: ' . $e->getMessage()
    ]);
}
?>