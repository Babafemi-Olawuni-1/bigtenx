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

// ── Locate the task by verify_code ───────────────────────────────────────────
// Strategy:
//   1. Try universal code → verify_code column in admin_tasks
//   2. Try individual code → task_codes table

$task = null;
$codeSource = 'universal';

// Check universal first
$stmt = $db->prepare("SELECT * FROM admin_tasks WHERE verify_code = ? AND active = 1 LIMIT 1");
$stmt->execute([$code]);
$task = $stmt->fetch(PDO::FETCH_ASSOC);

// If not found universally, check individual codes pool
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
            $tcId       = $row['tc_id'];
            unset($row['tc_id']);
            $task       = $row;
            $codeSource = 'individual';
        }
    } catch (Exception $e) {
        // task_codes table may not exist yet
    }
}

if (!$task) {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired code']);
    exit;
}

// ── Already completed? ───────────────────────────────────────────────────────
try {
    $stmt = $db->prepare("SELECT id FROM task_completions WHERE user_id = ? AND task_id = ?");
    $stmt->execute([$userId, $task['id']]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Task already completed']);
        exit;
    }
} catch (Exception $e) {
    // task_completions table missing — treat as not completed yet
}

// ── Hot-offer: max users cap ─────────────────────────────────────────────────
if ($task['type'] === 'hot' && !empty($task['max_users']) && $task['max_users'] > 0) {
    $stmt = $db->prepare("SELECT COUNT(*) AS cnt FROM task_completions WHERE task_id = ?");
    $stmt->execute([$task['id']]);
    $completions = (int)$stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    if ($completions >= $task['max_users']) {
        echo json_encode(['success' => false, 'message' => 'This offer has reached its maximum participants']);
        exit;
    }
}

// ── Hot-offer: expiry ────────────────────────────────────────────────────────
if ($task['type'] === 'hot' && !empty($task['expires_at'])) {
    if (strtotime($task['expires_at']) < time()) {
        echo json_encode(['success' => false, 'message' => 'This offer has expired']);
        exit;
    }
}

// ── Fetch user ───────────────────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT level, is_vip, coins, usd_balance, today_earnings, today_earnings_date, notifications
    FROM users WHERE id = ?
");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$userLevel = (int)($user['level']  ?? 0);
$isVip     = (int)($user['is_vip'] ?? 0);

// ── Reward calculation ───────────────────────────────────────────────────────
// Level multipliers: L0=1x, L1=1x, L2=1.2x, L3=1.5x, L4=2x
$multipliers = [0 => 1.0, 1 => 1.0, 2 => 1.2, 3 => 1.5, 4 => 2.0];
$multiplier  = $multipliers[$userLevel] ?? 1.0;
$baseReward  = (int)$task['reward_xp'];
$applyMult   = (int)($task['apply_multiplier'] ?? 1);
$rewardType  = $task['reward_type'] ?? 'xp';

$finalReward = $baseReward;
if ($applyMult) {
    $finalReward = (int)round($baseReward * $multiplier);
    if ($isVip) {
        $finalReward = (int)round($finalReward * 1.2); // VIP +20%
    }
}

// ── Today's earnings: reset if it's a new day ────────────────────────────────
$today          = date('Y-m-d');
$earningsDate   = $user['today_earnings_date'] ?? '';
$currentToday   = ($earningsDate === $today) ? (int)$user['today_earnings'] : 0;
$newTodayEarnings = $currentToday + $finalReward;

// ── Transact ─────────────────────────────────────────────────────────────────
$db->beginTransaction();
try {
    // Record completion
    $db->prepare(
        "INSERT INTO task_completions (user_id, task_id, code_used, completed_at) VALUES (?, ?, ?, NOW())"
    )->execute([$userId, $task['id'], $code]);

    // Mark individual code as used
    if ($codeSource === 'individual') {
        try {
            $db->prepare("UPDATE task_codes SET used_by = ?, used_at = NOW() WHERE task_id = ? AND code = ? AND used_by IS NULL")
               ->execute([$userId, $task['id'], $code]);
        } catch (Exception $e) { /* table may not exist */ }
    }

    // Award reward + update today_earnings
    if ($rewardType === 'cash') {
        $db->prepare("
            UPDATE users
            SET usd_balance = usd_balance + ?,
                today_earnings = ?,
                today_earnings_date = ?
            WHERE id = ?
        ")->execute([$finalReward, $newTodayEarnings, $today, $userId]);

        $newCash  = round((float)$user['usd_balance'] + $finalReward, 2);
        $newCoins = (int)$user['coins'];
    } else {
        $db->prepare("
            UPDATE users
            SET coins = coins + ?,
                today_earnings = ?,
                today_earnings_date = ?
            WHERE id = ?
        ")->execute([$finalReward, $newTodayEarnings, $today, $userId]);

        $newCoins = (int)$user['coins'] + $finalReward;
        $newCash  = round((float)$user['usd_balance'], 2);
    }

    // Add notification
    $notifs   = json_decode($user['notifications'] ?? '[]', true) ?: [];
    $notifs[] = [
        'id'      => uniqid(),
        'type'    => 'task',
        'message' => "✅ Task '{$task['title']}' completed! +" .
                     ($rewardType === 'cash' ? "\${$finalReward}" : "{$finalReward} XP"),
        'time'    => date('Y-m-d H:i:s'),
        'read'    => false,
    ];
    $db->prepare("UPDATE users SET notifications = ? WHERE id = ?")
       ->execute([json_encode($notifs), $userId]);

    $db->commit();

    echo json_encode([
        'success'          => true,
        'message'          => 'Code verified! +' . ($rewardType === 'cash' ? "\${$finalReward}" : "{$finalReward} XP"),
        'reward_type'      => $rewardType,
        'amount_earned'    => $finalReward,
        'xp_earned'        => $finalReward,       // legacy alias
        'new_coins'        => $newCoins,
        'new_usd_balance'  => $newCash,
        'today_earnings'   => $newTodayEarnings,
        'multiplier'       => $multiplier,
        'vip_bonus'        => (bool)$isVip,
    ]);

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error processing reward: ' . $e->getMessage()]);
}
