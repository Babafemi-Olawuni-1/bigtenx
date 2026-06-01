<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$token = $_GET['token'] ?? $_POST['token'] ?? '';

if (empty($token)) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header('Location: https://bigtenx.com/login?verified=error&msg=Invalid verification link');
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'Verification token required']);
    exit;
}

$db = getDB();

// Find user with matching token that hasn't expired
$stmt = $db->prepare("SELECT id, email, username FROM users WHERE verification_token = ? AND token_expires > NOW() AND email_verified = 0");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header('Location: https://bigtenx.com/login?verified=error&msg=Invalid or expired verification link');
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'Invalid or expired verification token']);
    exit;
}

// Update user as verified
$stmt = $db->prepare("UPDATE users SET email_verified = 1, is_verified = 1, verification_token = NULL, token_expires = NULL WHERE id = ?");
$stmt->execute([$user['id']]);

// Add welcome notification
$stmt = $db->prepare("SELECT notifications FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$notifRow = $stmt->fetch(PDO::FETCH_ASSOC);
$notifs = json_decode($notifRow['notifications'] ?? '[]', true) ?: [];
$notifs[] = [
    'id' => uniqid(),
    'type' => 'welcome',
    'message' => "🎉 Welcome to BIGTENX! Your email has been verified. Start earning today!",
    'time' => date('Y-m-d H:i:s'),
    'read' => false
];
$db->prepare("UPDATE users SET notifications = ? WHERE id = ?")->execute([json_encode($notifs), $user['id']]);

// Redirect to login page with success message
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Location: https://bigtenx.com/login?verified=success&msg=Email verified! You can now log in.');
    exit;
}

echo json_encode(['success' => true, 'message' => 'Email verified successfully! You can now log in.']);