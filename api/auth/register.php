<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$country = trim($input['country'] ?? '');
$password = $input['password'] ?? '';
$referral_code = trim($input['referral_code'] ?? '');

if (empty($username) || empty($email) || empty($password) || empty($country)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

$db = getDB();

// Check if email exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

// Check if username exists
$stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Username already taken']);
    exit;
}

// Generate verification token
$verificationToken = bin2hex(random_bytes(32));
$tokenExpires = date('Y-m-d H:i:s', strtotime('+24 hours'));

// Generate referral code
$refCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $username), 0, 5) . rand(100, 999));

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user with 5 XP bonus - NOT VERIFIED
$stmt = $db->prepare(
    "INSERT INTO users (username, email, country, password_hash, referral_code, coins, verification_token, token_expires, email_verified, is_verified, created_at) 
     VALUES (?, ?, ?, ?, ?, 5, ?, ?, 0, 0, NOW())"
);
$stmt->execute([$username, $email, $country, $hashedPassword, $refCode, $verificationToken, $tokenExpires]);

$userId = $db->lastInsertId();

// For now, auto-verify for testing (remove this line later)
$db->prepare("UPDATE users SET email_verified = 1, is_verified = 1 WHERE id = ?")->execute([$userId]);

echo json_encode([
    'success' => true,
    'message' => 'Account created successfully! You received 5 XP bonus.'
]);