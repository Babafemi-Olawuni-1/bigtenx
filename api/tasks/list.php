<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

$db = getDB();

// Return ONLY tasks with type = 'daily' and active = 1
$stmt = $db->prepare("
    SELECT 
        id,
        title,
        description,
        platform,
        url,
        reward_xp,
        reward_type,
        apply_multiplier,
        code_type,
        verify_code,
        steps
    FROM admin_tasks
    WHERE active = 1
      AND type = 'daily'
    ORDER BY created_at DESC
");
$stmt->execute();
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Cast numeric fields and decode steps JSON
foreach ($tasks as &$t) {
    $t['reward_xp']        = (int)$t['reward_xp'];
    $t['apply_multiplier'] = (int)$t['apply_multiplier'];

    // Decode steps from JSON string → array (null/empty becomes empty array)
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