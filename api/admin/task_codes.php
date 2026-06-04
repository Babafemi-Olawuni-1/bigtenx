<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function genUniqueCode($db, $len = 8) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $attempts = 0;
    do {
        $code = '';
        for ($i = 0; $i < $len; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        // Check uniqueness across both tables
        $s1 = $db->prepare("SELECT id FROM task_codes  WHERE code = ?");
        $s1->execute([$code]);
        $s2 = $db->prepare("SELECT id FROM admin_tasks WHERE verify_code = ?");
        $s2->execute([$code]);
        if (!$s1->fetch() && !$s2->fetch()) return $code;
        $attempts++;
    } while ($attempts < 20);

    throw new Exception('Could not generate unique code after 20 attempts');
}

// ── GET codes for a task ──────────────────────────────────────────────────────
if ($method === 'GET') {
    $taskId = (int)($_GET['task_id'] ?? 0);
    if (!$taskId) {
        echo json_encode(['success' => false, 'message' => 'task_id required']);
        exit;
    }

    try {
        $stmt = $db->prepare("
            SELECT tc.id, tc.code, tc.used_by, tc.used_at,
                   u.username AS used_by_username
            FROM task_codes tc
            LEFT JOIN users u ON u.id = tc.used_by
            WHERE tc.task_id = ?
            ORDER BY tc.id ASC
        ");
        $stmt->execute([$taskId]);
        $codes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'codes' => $codes, 'count' => count($codes)]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ── POST: generate N individual codes for a task ──────────────────────────────
if ($method === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $taskId = (int)($input['task_id'] ?? 0);
    $count  = min(500, max(1, (int)($input['count'] ?? 1)));  // cap at 500

    if (!$taskId) {
        echo json_encode(['success' => false, 'message' => 'task_id required']);
        exit;
    }

    // Verify the task exists and is individual type
    $taskStmt = $db->prepare("SELECT id, code_type FROM admin_tasks WHERE id = ?");
    $taskStmt->execute([$taskId]);
    $task = $taskStmt->fetch(PDO::FETCH_ASSOC);

    if (!$task) {
        echo json_encode(['success' => false, 'message' => 'Task not found']);
        exit;
    }

    try {
        $generated = [];
        $insert    = $db->prepare("INSERT INTO task_codes (task_id, code) VALUES (?, ?)");

        for ($i = 0; $i < $count; $i++) {
            $code = genUniqueCode($db);
            $insert->execute([$taskId, $code]);
            $generated[] = $code;
        }

        echo json_encode([
            'success' => true,
            'task_id' => $taskId,
            'codes'   => $generated,
            'count'   => count($generated),
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Code generation failed: ' . $e->getMessage()]);
    }
    exit;
}

// ── DELETE: remove all unused codes for a task ────────────────────────────────
if ($method === 'DELETE') {
    $taskId = (int)($_GET['task_id'] ?? 0);
    if (!$taskId) {
        echo json_encode(['success' => false, 'message' => 'task_id required']);
        exit;
    }
    try {
        $stmt = $db->prepare("DELETE FROM task_codes WHERE task_id = ? AND used_by IS NULL");
        $stmt->execute([$taskId]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
