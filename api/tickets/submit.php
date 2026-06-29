<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input   = json_decode(file_get_contents('php://input'), true);
$userId  = (int)($input['user_id'] ?? 0);
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

if (!$userId || !$subject || !$message) { echo json_encode(['success'=>false,'message'=>'user_id, subject and message required']); exit; }

$db = getDB();

// Ensure tickets table exists
$db->exec("CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open','replied','closed') DEFAULT 'open',
    admin_reply TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$stmt = $db->prepare("INSERT INTO tickets (user_id, subject, message, status) VALUES (?, ?, ?, 'open')");
$stmt->execute([$userId, $subject, $message]);
$ticketId = $db->lastInsertId();

echo json_encode(['success'=>true,'message'=>'Support ticket submitted successfully','ticket_id'=>$ticketId]);
?>
