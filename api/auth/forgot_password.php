<?php
ini_set('display_errors', 0);
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email required']);
    exit;
}

$db = getDB();

// Check if user exists
$stmt = $db->prepare("SELECT id, username FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Don't reveal if email exists or not for security
    echo json_encode(['success' => true, 'message' => 'If your email is registered, you will receive a reset link']);
    exit;
}

// Generate reset token
$resetToken = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Store token in database
$stmt = $db->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
$stmt->execute([$resetToken, $expires, $user['id']]);

// For local testing - show reset link in console
$resetLink = "https://bigtenx.com/reset-password?token=" . $resetToken;
error_log("Reset link for {$email}: " . $resetLink);

// For production, send email here
// For now, return the link in dev mode
$isLocal = $_SERVER['REMOTE_ADDR'] === '127.0.0.1' || $_SERVER['HTTP_HOST'] === 'localhost';
if ($isLocal) {
    echo json_encode([
        'success' => true,
        'message' => 'Check console for reset link (dev mode)',
        'dev_reset_url' => $resetLink
    ]);
} else {
    // TODO: Send email with reset link
    echo json_encode(['success' => true, 'message' => 'If your email is registered, you will receive a reset link']);
}