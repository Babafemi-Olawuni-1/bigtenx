<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET: list all tickets or tickets for a user
if ($method === 'GET') {
    $userId = (int)($_GET['user_id'] ?? 0);
    try {
        if ($userId) {
            $stmt = $db->prepare("SELECT t.*, u.username FROM tickets t JOIN users u ON u.id = t.user_id WHERE t.user_id = ? ORDER BY t.created_at DESC");
            $stmt->execute([$userId]);
        } else {
            $stmt = $db->query("SELECT t.*, u.username FROM tickets t JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT 200");
        }
        echo json_encode(['success'=>true,'tickets'=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Exception $e) {
        echo json_encode(['success'=>true,'tickets'=>[],'note'=>'Tickets table not created yet']);
    }
    exit;
}

// POST: reply to a ticket
if ($method === 'POST') {
    $input    = json_decode(file_get_contents('php://input'), true);
    $ticketId = (int)($input['ticket_id'] ?? 0);
    $reply    = trim($input['reply'] ?? '');
    $status   = $input['status'] ?? 'replied';

    if (!$ticketId || !$reply) { echo json_encode(['success'=>false,'message'=>'ticket_id and reply required']); exit; }

    try {
        $db->prepare("UPDATE tickets SET admin_reply = ?, status = ?, updated_at = NOW() WHERE id = ?")
           ->execute([$reply, $status, $ticketId]);
        echo json_encode(['success'=>true,'message'=>'Reply sent']);
    } catch (Exception $e) {
        echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
    }
    exit;
}

echo json_encode(['success'=>false,'message'=>'Method not allowed']);
?>
