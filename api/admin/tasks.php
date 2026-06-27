<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function genCode(PDO $db, int $len = 8): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for ($try = 0; $try < 20; $try++) {
        $code = '';
        for ($i = 0; $i < $len; $i++) $code .= $chars[random_int(0, strlen($chars)-1)];
        $s1 = $db->prepare("SELECT id FROM admin_tasks WHERE verify_code = ?");
        $s1->execute([$code]);
        $s2 = $db->prepare("SELECT id FROM task_codes WHERE code = ?");
        $s2->execute([$code]);
        if (!$s1->fetch() && !$s2->fetch()) return $code;
    }
    throw new Exception('Could not generate unique code');
}

function decodeSteps(&$task): void {
    if (!empty($task['steps'])) {
        $d = json_decode($task['steps'], true);
        $task['steps'] = is_array($d) ? $d : [];
    } else {
        $task['steps'] = [];
    }
}

function castTask(array &$task): void {
    $task['id']               = (int)$task['id'];
    $task['reward_xp']        = (float)($task['reward_xp'] ?? 0);
    $task['apply_multiplier'] = (int)($task['apply_multiplier'] ?? 1);
    $task['active']           = (int)($task['active']           ?? 1);
    $task['max_users']        = isset($task['max_users']) && $task['max_users'] !== null ? (int)$task['max_users'] : null;
    decodeSteps($task);
}

// ── LIST ──────────────────────────────────────────────────────────────────────
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $rows = $db->query("
            SELECT 
                at.*,
                (
                    SELECT COUNT(*)
                    FROM daily_task_attempts dta
                    WHERE dta.task_id = at.id
                ) AS participants,
                (
                    SELECT COUNT(*)
                    FROM task_completions tc
                    WHERE tc.task_id = at.id
                ) AS completed
            FROM admin_tasks at
            ORDER BY at.created_at DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($rows as &$row) {
            castTask($row);
            
            $row['participants'] = (int)($row['participants'] ?? 0);
            $row['completed'] = (int)($row['completed'] ?? 0);
            
            if ($row['type'] === 'hot' && !empty($row['max_users'])) {
                $row['remaining_slots'] = max(
                    0,
                    (int)$row['max_users'] - $row['completed']
                );
            } else {
                $row['remaining_slots'] = null;
            }
            
            if ($row['code_type'] === 'individual') {
                try {
                    $cs = $db->prepare("SELECT COUNT(*) FROM task_codes WHERE task_id = ?");
                    $cs->execute([$row['id']]);
                    $row['individual_codes_count'] = (int)$cs->fetchColumn();
                } catch (Exception $e) { $row['individual_codes_count'] = 0; }
            }
        }
        unset($row);
        echo json_encode(['success' => true, 'tasks' => $rows]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage(), 'tasks' => []]);
    }
    exit;
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
if ($method === 'GET' && isset($_GET['id'])) {
    $id   = (int)$_GET['id'];
    $stmt = $db->prepare("SELECT * FROM admin_tasks WHERE id = ?");
    $stmt->execute([$id]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($task) castTask($task);
    echo json_encode(['success' => true, 'task' => $task]);
    exit;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $in = json_decode(file_get_contents('php://input'), true) ?? [];

    $title            = trim($in['title']       ?? '');
    $description      = trim($in['description'] ?? '');
    $type             = in_array($in['type'] ?? '', ['daily','hot']) ? $in['type'] : 'daily';
    $url              = trim($in['url']         ?? '');
    if ($type === 'daily') {
        $url = '';
    }
    $platform         = trim($in['platform']    ?? '');
    $reward_xp        = max(0, (float)($in['reward_xp'] ?? $in['reward'] ?? 0));
    $reward_type      = $in['reward_type'] === 'cash' ? 'cash' : 'xp';
    $apply_multiplier = (int)($in['apply_multiplier'] ?? 1) ? 1 : 0;
    $code_type        = $in['code_type'] === 'individual' ? 'individual' : 'universal';
    $hot_limit_type   = trim($in['hot_limit_type'] ?? 'timer');
    $expires_at       = ($type === 'hot' && $hot_limit_type === 'timer' && !empty($in['expires_at'])) ? $in['expires_at'] : null;
    $max_users        = ($type === 'hot' && $hot_limit_type === 'users' && !empty($in['max_users'])) ? (int)$in['max_users'] : null;
    $steps_raw        = $in['steps'] ?? [];
    $steps            = !empty($steps_raw) ? json_encode(array_values($steps_raw)) : null;

    if (empty($title)) { echo json_encode(['success'=>false,'message'=>'Title required']); exit; }
    if ($reward_xp <= 0) { echo json_encode(['success'=>false,'message'=>'Reward amount must be greater than 0']); exit; }
    
    if (empty($steps_raw) || !is_array($steps_raw) || count($steps_raw) < 1) {
        echo json_encode([
            'success' => false,
            'message' => 'At least one task step is required'
        ]);
        exit;
    }
    
    if ($type === 'hot' && $hot_limit_type === 'timer' && !$expires_at) { echo json_encode(['success'=>false,'message'=>'Hot offer with Timer requires an expiry date']); exit; }
    if ($type === 'hot' && $hot_limit_type === 'users' && !$max_users) { echo json_encode(['success'=>false,'message'=>'Hot offer with Max Users requires a user limit']); exit; }

    $universal_code = null;
    if ($code_type === 'universal') {
        $provided = strtoupper(trim($in['verify_code'] ?? ''));
        if (!empty($provided)) {
            $chk = $db->prepare("SELECT id FROM admin_tasks WHERE verify_code = ? AND id != 0");
            $chk->execute([$provided]);
            if ($chk->fetch()) {
                echo json_encode(['success'=>false,'message'=>'That code is already used by another task. Please generate a new one.']);
                exit;
            }
            $universal_code = $provided;
        } else {
            $universal_code = genCode($db);
        }
    }

    try {
        $stmt = $db->prepare("INSERT INTO admin_tasks
            (title, description, type, url, platform, reward_xp, reward_type,
             apply_multiplier, code_type, verify_code, expires_at, max_users, steps, active, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,NOW())");
        $stmt->execute([
            $title, $description, $type, $url, $platform,
            $reward_xp, $reward_type, $apply_multiplier,
            $code_type, $universal_code, $expires_at, $max_users, $steps
        ]);
        $taskId = (int)$db->lastInsertId();

        $generatedCodes = [];
        
        // ─── FIX: Improved individual code generation ─────────────────────
        if ($code_type === 'individual') {
            $count = isset($in['individual_count'])
                ? max(1, min(500, (int)$in['individual_count']))
                : 10;

            try {
                $insert = $db->prepare("
                    INSERT INTO task_codes (task_id, code, used_by, used_at)
                    VALUES (?, ?, NULL, NULL)
                ");

                for ($i = 0; $i < $count; $i++) {
                    $c = genCode($db);
                    $insert->execute([$taskId, $c]);
                    $generatedCodes[] = $c;
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Individual code generation failed: ' . $e->getMessage()
                ]);
                exit;
            }
        }

        echo json_encode([
            'success'          => true,
            'task_id'          => $taskId,
            'verify_code'      => $universal_code,
            'codes_generated'  => count($generatedCodes),
        ]);
    } catch (Exception $e) {
        echo json_encode(['success'=>false,'message'=>'Create failed: '.$e->getMessage()]);
    }
    exit;
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $in = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($in['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid task ID']); exit; }

    $title            = trim($in['title']       ?? '');
    $description      = trim($in['description'] ?? '');
    $type             = in_array($in['type'] ?? '', ['daily','hot']) ? $in['type'] : 'daily';
    $url              = trim($in['url']         ?? '');
    if ($type === 'daily') {
        $url = '';
    }
    $platform         = trim($in['platform']    ?? '');
    $reward_xp        = max(0, (float)($in['reward_xp'] ?? $in['reward'] ?? 0));
    $reward_type      = $in['reward_type'] === 'cash' ? 'cash' : 'xp';
    $apply_multiplier = (int)($in['apply_multiplier'] ?? 1) ? 1 : 0;
    $hot_limit_type   = trim($in['hot_limit_type'] ?? 'timer');
    $expires_at       = ($type === 'hot' && $hot_limit_type === 'timer' && !empty($in['expires_at'])) ? $in['expires_at'] : null;
    $max_users        = ($type === 'hot' && $hot_limit_type === 'users' && !empty($in['max_users'])) ? (int)$in['max_users'] : null;
    $steps_raw        = $in['steps'] ?? [];
    $steps            = !empty($steps_raw) ? json_encode(array_values($steps_raw)) : null;
    $active           = (int)($in['active'] ?? 1) ? 1 : 0;

    try {
        $db->prepare("UPDATE admin_tasks SET
            title=?, description=?, type=?, url=?, platform=?,
            reward_xp=?, reward_type=?, apply_multiplier=?,
            expires_at=?, max_users=?, steps=?, active=?
            WHERE id=?")
        ->execute([
            $title, $description, $type, $url, $platform,
            $reward_xp, $reward_type, $apply_multiplier,
            $expires_at, $max_users, $steps, $active, $id
        ]);

        $stmt = $db->prepare("SELECT * FROM admin_tasks WHERE id = ?");
        $stmt->execute([$id]);
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($updated) castTask($updated);

        echo json_encode(['success'=>true, 'task'=>$updated]);
    } catch (Exception $e) {
        echo json_encode(['success'=>false,'message'=>'Update failed: '.$e->getMessage()]);
    }
    exit;
}

// ── TOGGLE ACTIVE ─────────────────────────────────────────────────────────────
if ($method === 'PATCH') {
    $in = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($in['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid ID']); exit; }
    $db->prepare("UPDATE admin_tasks SET active = IF(active=1,0,1) WHERE id=?")->execute([$id]);
    $stmt = $db->prepare("SELECT active FROM admin_tasks WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true, 'active'=>(int)$stmt->fetch(PDO::FETCH_ASSOC)['active']]);
    exit;
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid ID']); exit; }
    try {
        $db->prepare("DELETE FROM task_completions WHERE task_id=?")->execute([$id]);
        $db->prepare("DELETE FROM task_codes WHERE task_id=?")->execute([$id]);
        $s = $db->prepare("DELETE FROM admin_tasks WHERE id=?");
        $s->execute([$id]);
        echo json_encode(['success' => $s->rowCount() > 0, 'message' => $s->rowCount() > 0 ? 'Deleted' : 'Not found']);
    } catch (Exception $e) {
        echo json_encode(['success'=>false,'message'=>'Delete failed: '.$e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success'=>false,'message'=>'Method not allowed']);