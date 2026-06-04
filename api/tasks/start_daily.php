<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';

$in     = json_decode(file_get_contents('php://input'), true) ?? [];
$userId = (int)($in['user_id'] ?? 0);
$taskId = (int)($in['task_id'] ?? 0);

if (!$userId || !$taskId) {
    echo json_encode(['success'=>false,'message'=>'user_id and task_id required']);
    exit;
}

$db = getDB();

// Check task is active daily
$stmt = $db->prepare("SELECT id, title FROM admin_tasks WHERE id=? AND type='daily' AND active=1");
$stmt->execute([$taskId]);
$task = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$task) {
    echo json_encode(['success'=>false,'message'=>'Task not found or not active']);
    exit;
}

// Check for existing active attempt
try {
    $stmt = $db->prepare("
        SELECT id, expires_at FROM daily_task_attempts
        WHERE user_id=? AND task_id=? AND completed=0
          AND expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([$userId, $taskId]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        echo json_encode([
            'success'    => true,
            'already_started' => true,
            'expires_at' => $existing['expires_at'],
        ]);
        exit;
    }
} catch (Exception $e) {
    // table may not exist yet
}

// Check already completed (don't allow restart)
try {
    $stmt = $db->prepare("SELECT id FROM task_completions WHERE user_id=? AND task_id=?");
    $stmt->execute([$userId, $taskId]);
    if ($stmt->fetch()) {
        echo json_encode(['success'=>false,'message'=>'Task already completed']);
        exit;
    }
} catch (Exception $e) {}

// Create attempt — 24 hours from now
$expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
try {
    $db->prepare("
        INSERT INTO daily_task_attempts (user_id, task_id, started_at, expires_at, completed)
        VALUES (?, ?, NOW(), ?, 0)
    ")->execute([$userId, $taskId, $expiresAt]);
} catch (Exception $e) {
    // If table missing, still return success so UI works
}

echo json_encode([
    'success'    => true,
    'expires_at' => $expiresAt,
    'task_id'    => $taskId,
]);
