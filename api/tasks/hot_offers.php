<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

$db = getDB();

// Return ONLY tasks with type = 'hot', active = 1
// Also exclude tasks that are past their expiry date (if set)
// Also exclude tasks that have hit their max_users cap (if set)
$stmt = $db->prepare("
    SELECT 
        t.id,
        t.title,
        t.description,
        t.platform,
        t.url,
        t.reward_xp,
        t.reward_type,
        t.apply_multiplier,
        t.code_type,
        t.verify_code,
        t.expires_at,
        t.max_users,
        t.steps,
        (SELECT COUNT(*) FROM task_completions WHERE task_id = t.id) AS completions
    FROM admin_tasks t
    WHERE t.active = 1
      AND t.type = 'hot'
      AND (t.expires_at IS NULL OR t.expires_at > NOW())
      AND (t.max_users IS NULL OR (
            SELECT COUNT(*) FROM task_completions WHERE task_id = t.id
          ) < t.max_users)
    ORDER BY t.created_at DESC
");
$stmt->execute();
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Cast numeric fields, decode steps JSON, pass expires_at as-is for frontend countdown
foreach ($tasks as &$t) {
    $t['reward_xp']        = (int)$t['reward_xp'];
    $t['apply_multiplier'] = (int)$t['apply_multiplier'];
    $t['completions']      = (int)$t['completions'];
    $t['max_users']        = $t['max_users'] !== null ? (int)$t['max_users'] : null;

    // Decode steps from JSON string → array
    if (!empty($t['steps'])) {
        $decoded = json_decode($t['steps'], true);
        $t['steps'] = is_array($decoded) ? $decoded : [];
    } else {
        $t['steps'] = [];
    }

    // Only expose verify_code for universal tasks
    if ($t['code_type'] !== 'universal') {
        $t['verify_code'] = null;
    }
}
unset($t);

echo json_encode(['success' => true, 'tasks' => $tasks]);