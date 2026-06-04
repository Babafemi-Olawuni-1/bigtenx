<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input         = json_decode(file_get_contents('php://input'), true);
$username      = trim($input['username']     ?? '');
$email         = trim($input['email']        ?? '');
$country       = trim($input['country']      ?? '');
$password      = $input['password']          ?? '';
$referral_code = strtoupper(trim($input['referral_code'] ?? ''));

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

// Check duplicates
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}
$stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Username already taken']);
    exit;
}

// Resolve referrer
$referrerId = null;
if (!empty($referral_code)) {
    $stmt = $db->prepare("SELECT id FROM users WHERE referral_code = ? LIMIT 1");
    $stmt->execute([$referral_code]);
    $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($referrer) {
        $referrerId = (int)$referrer['id'];
    }
}

// Generate tokens
$verificationToken = bin2hex(random_bytes(32));
$tokenExpires      = date('Y-m-d H:i:s', strtotime('+24 hours'));
$refCode           = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $username), 0, 5) . rand(100, 999));
$hashedPassword    = password_hash($password, PASSWORD_DEFAULT);

$db->beginTransaction();
try {
    // Insert new user — referred_by stores referrer's ID if one exists
    $stmt = $db->prepare("
        INSERT INTO users
            (username, email, country, password_hash, referral_code, coins,
             referred_by, verification_token, token_expires,
             email_verified, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, 5, ?, ?, ?, 0, 0, NOW())
    ");
    $stmt->execute([
        $username, $email, $country, $hashedPassword, $refCode,
        $referrerId, $verificationToken, $tokenExpires,
    ]);
    $newUserId = $db->lastInsertId();

    // Auto-verify for now (remove later when email verification is live)
    $db->prepare("UPDATE users SET email_verified = 1, is_verified = 1 WHERE id = ?")
       ->execute([$newUserId]);

    // Increment referrer's total_referrals counter
    if ($referrerId) {
        $db->prepare("UPDATE users SET total_referrals = total_referrals + 1 WHERE id = ?")
           ->execute([$referrerId]);
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully! You received 5 XP bonus.',
    ]);
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
}
