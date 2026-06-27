<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';

try {
    $db = getDB();

    // task_completions may not exist yet — check first
    $hasTc = true;
    try {
        $db->query("SELECT 1 FROM task_completions LIMIT 1");
    } catch (Exception $e) {
        $hasTc = false;
    }

    $completionsExpr = $hasTc
        ? "(SELECT COUNT(*) FROM task_completions WHERE task_id = t.id)"
        : "0";

    $capFilter = $hasTc
        ? "AND (t.max_users IS NULL OR {$completionsExpr} < t.max_users)"
        : "";

    // ─── FIX: Include expires_at in SELECT ────────────────────────────────
    $sql = "
        SELECT
            t.id,
            t.title,
            t.description,
            t.platform,
            t.url,
            t.reward_xp,
            COALESCE(t.reward_type, 'xp')    AS reward_type,
            COALESCE(t.apply_multiplier, 1)  AS apply_multiplier,
            COALESCE(t.code_type, 'universal') AS code_type,
            t.verify_code,
            t.expires_at,
            t.max_users,
            t.steps,
            {$completionsExpr} AS completions
        FROM admin_tasks t
        WHERE t.active = 1
          AND t.type   = 'hot'
          AND (t.expires_at IS NULL OR t.expires_at > NOW())
          {$capFilter}
        ORDER BY t.created_at DESC
    ";

    $tasks = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    foreach ($tasks as &$t) {
        $t['reward_xp']        = (float)$t['reward_xp'];  // Changed to float for decimal support
        $t['apply_multiplier'] = (int)$t['apply_multiplier'];
        $t['completions']      = (int)$t['completions'];
        $t['max_users']        = $t['max_users'] !== null ? (int)$t['max_users'] : null;

        // ─── FIX: Decode steps properly ──────────────────────────────────
        $t['steps'] = (!empty($t['steps']))
            ? (is_array($decoded = json_decode($t['steps'], true)) ? $decoded : [])
            : [];

        // Only expose the code for universal hot offers
        if ($t['code_type'] !== 'universal') {
            $t['verify_code'] = null;
        }
    }
    unset($t);

    echo json_encode(['success' => true, 'tasks' => $tasks]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error loading hot offers: ' . $e->getMessage(), 'tasks' => []]);
}