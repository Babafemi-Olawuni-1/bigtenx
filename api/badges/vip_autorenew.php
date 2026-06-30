<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input     = json_decode(file_get_contents('php://input'), true);
$userId    = (int)($input['user_id']    ?? 0);
$autoRenew = (int)($input['auto_renew'] ?? 0);

if (!$userId) { echo json_encode(['success'=>false,'message'=>'user_id required']); exit; }

$db = getDB();

// Ensure vip_auto_renew column exists
try { $db->exec("ALTER TABLE user_vip ADD COLUMN auto_renew TINYINT(1) DEFAULT 0"); } catch (Exception $e) {}

try {
    $db->prepare("UPDATE user_vip SET auto_renew = ? WHERE user_id = ? AND active = 1")
       ->execute([$autoRenew, $userId]);
    echo json_encode(['success'=>true,'message'=> $autoRenew ? 'Auto renew enabled' : 'Auto renew disabled', 'auto_renew'=> $autoRenew]);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=> $e->getMessage()]);
}
?>
