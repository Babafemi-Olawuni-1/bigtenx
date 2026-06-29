<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input       = json_decode(file_get_contents('php://input'), true);
$userId      = (int)($input['user_id'] ?? 0);
$currentPass = $input['current_password'] ?? '';
$newPass     = $input['new_password'] ?? '';

if (!$userId || !$currentPass || !$newPass) { echo json_encode(['success'=>false,'message'=>'All fields required']); exit; }
if (strlen($newPass) < 6) { echo json_encode(['success'=>false,'message'=>'New password must be at least 6 characters']); exit; }

$db = getDB();
$stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user || !password_verify($currentPass, $user['password_hash'])) {
    echo json_encode(['success'=>false,'message'=>'Current password is incorrect']); exit;
}

$db->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([password_hash($newPass, PASSWORD_DEFAULT), $userId]);
echo json_encode(['success'=>true,'message'=>'Password changed successfully']);
?>
