<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Hardcoded admin for now
if ($email === 'admin@bigtenx.com' && $password === 'BigTenX@Admin2025') {
    $token = bin2hex(random_bytes(32));
    echo json_encode([
        'success' => true,
        'token' => $token,
        'email' => $email,
        'user' => ['id' => 1, 'username' => 'admin', 'email' => $email]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}