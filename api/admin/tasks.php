<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function genCode($len = 8) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < $len; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

// Helper: decode steps field in a task row
function decodeTaskSteps(&$task) {
    if (!empty($task['steps'])) {
        $decoded = json_decode($task['steps'], true);
        $task['steps'] = is_array($decoded) ? $decoded : [];
    } else {
        $task['steps'] = [];
    }
}

// ── CREATE TASK ──────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $title            = trim($input['title']            ?? '');
    $description      = trim($input['description']      ?? '');
    $type             = trim($input['type']             ?? 'daily');   // 'daily' | 'hot'
    $url              = trim($input['url']              ?? '');
    $platform         = trim($input['platform']         ?? '');
    $reward_xp        = (int)($input['reward']          ?? 0);        // frontend sends 'reward'
    $reward_type      = trim($input['reward_type']      ?? 'xp');
    $apply_multiplier = (int)($input['apply_multiplier'] ?? 1);
    $code_type        = $input['code_type']             ?? 'universal';
    $expires_at       = !empty($input['expires_at'])    ? $input['expires_at'] : null;
    $max_users        = !empty($input['max_users'])     ? (int)$input['max_users'] : null;
    $steps            = !empty($input['steps'])         ? json_encode($input['steps']) : null;

    if (empty($title)) {
        echo json_encode(['success' => false, 'message' => 'Title required']);
        exit;
    }

    // Generate universal code only for universal code_type
    $universal_code = ($code_type === 'universal') ? genCode(8) : null;

    $stmt = $db->prepare(
        "INSERT INTO admin_tasks
            (title, description, type, url, platform, reward_xp, reward_type,
             apply_multiplier, code_type, verify_code, expires_at, max_users, steps, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())"
    );
    $stmt->execute([
        $title, $description, $type, $url, $platform,
        $reward_xp, $reward_type, $apply_multiplier,
        $code_type, $universal_code, $expires_at, $max_users, $steps
    ]);

    echo json_encode([
        'success'     => true,
        'task_id'     => $db->lastInsertId(),
        'verify_code' => $universal_code,   // null for individual tasks
        'code_type'   => $code_type,
        'type'        => $type
    ]);
    exit;
}

// ── LIST ALL TASKS (ADMIN) ───────────────────────────────────────────────────
if ($method === 'GET' && !isset($_GET['id'])) {
    $rows = $db->query("SELECT * FROM admin_tasks ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) {
        decodeTaskSteps($row);
        $row['reward_xp'] = (int)$row['reward_xp'];
    }
    unset($row);
    echo json_encode(['success' => true, 'tasks' => $rows]);
    exit;
}

// ── GET SINGLE TASK ──────────────────────────────────────────────────────────
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $stmt = $db->prepare("SELECT * FROM admin_tasks WHERE id = ?");
    $stmt->execute([$id]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($task) {
        decodeTaskSteps($task);
        $task['reward_xp'] = (int)$task['reward_xp'];
    }
    echo json_encode(['success' => true, 'task' => $task]);
    exit;
}

// ── UPDATE TASK ──────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);

    $title            = trim($input['title']             ?? '');
    $description      = trim($input['description']       ?? '');
    $type             = trim($input['type']              ?? 'daily');
    $url              = trim($input['url']               ?? '');
    $platform         = trim($input['platform']          ?? '');
    // Accept both 'reward' (form field name) and 'reward_xp' (DB field name)
    $reward_xp        = (int)($input['reward']           ?? $input['reward_xp'] ?? 0);
    $reward_type      = trim($input['reward_type']       ?? 'xp');
    $apply_multiplier = (int)($input['apply_multiplier'] ?? 1);
    $expires_at       = !empty($input['expires_at'])     ? $input['expires_at'] : null;
    $max_users        = !empty($input['max_users'])      ? (int)$input['max_users'] : null;
    $steps            = !empty($input['steps'])          ? json_encode($input['steps']) : null;
    $active           = (int)($input['active']           ?? 1);

    $stmt = $db->prepare(
        "UPDATE admin_tasks SET
            title = ?, description = ?, type = ?, url = ?, platform = ?,
            reward_xp = ?, reward_type = ?, apply_multiplier = ?,
            expires_at = ?, max_users = ?, steps = ?, active = ?
         WHERE id = ?"
    );
    $stmt->execute([
        $title, $description, $type, $url, $platform,
        $reward_xp, $reward_type, $apply_multiplier,
        $expires_at, $max_users, $steps, $active, $id
    ]);

    // Return updated task so frontend can refresh the list immediately
    $stmt2 = $db->prepare("SELECT * FROM admin_tasks WHERE id = ?");
    $stmt2->execute([$id]);
    $updated = $stmt2->fetch(PDO::FETCH_ASSOC);
    if ($updated) {
        decodeTaskSteps($updated);
        $updated['reward_xp'] = (int)$updated['reward_xp'];
    }

    echo json_encode(['success' => true, 'task' => $updated]);
    exit;
}

// ── TOGGLE ACTIVE ────────────────────────────────────────────────────────────
if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    $db->prepare("UPDATE admin_tasks SET active = NOT active WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

// ── DELETE TASK ──────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $db->prepare("DELETE FROM admin_tasks WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}