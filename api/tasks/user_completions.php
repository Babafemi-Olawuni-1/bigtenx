<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'GET method required']);
    exit;
}

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}

$db = getDB();

// Get all completed task IDs for this user
$stmt = $db->prepare("
    SELECT DISTINCT task_id FROM task_completions 
    WHERE user_id = ?
");
$stmt->execute([$user_id]);
$completed = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode([
    'success' => true,
    'completed_tasks' => $completed
]);