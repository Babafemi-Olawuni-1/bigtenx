<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$userId = (int)($_GET['user_id'] ?? 0);
if (!$userId) { echo json_encode(['success'=>false,'message'=>'user_id required']); exit; }

$db = getDB();
try {
    $stmt = $db->prepare("SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    echo json_encode(['success'=>true,'tickets'=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(['success'=>true,'tickets'=>[],'note'=>'Tickets table not yet created']);
}
?>
