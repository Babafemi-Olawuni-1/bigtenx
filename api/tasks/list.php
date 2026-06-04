<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';

try {
    $db = getDB();

    // Fetch active daily tasks
    // COALESCE handles servers where optional columns may not exist yet
    $stmt = $db->prepare("
        SELECT
            id,
            title,
            description,
            platform,
            url,
            reward_xp,
            COALESCE(reward_type,  'xp')        AS reward_type,
            COALESCE(apply_multiplier, 1)        AS apply_multiplier,
            COALESCE(code_type, 'universal')     AS code_type,
            verify_code,
            steps
        FROM admin_tasks
        WHERE active = 1
          AND type = 'daily'
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($tasks as &$t) {
        $t['reward_xp']        = (int)$t['reward_xp'];
        $t['apply_multiplier'] = (int)$t['apply_multiplier'];

        // Decode steps JSON → array
        $t['steps'] = (!empty($t['steps']))
            ? (is_array($decoded = json_decode($t['steps'], true)) ? $decoded : [])
            : [];

        // Never expose verify_code on daily tasks to the user —
        // admin gives the code to users manually
        $t['verify_code'] = null;
    }
    unset($t);

    echo json_encode(['success' => true, 'tasks' => $tasks]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error loading tasks: ' . $e->getMessage(), 'tasks' => []]);
}
