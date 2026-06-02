<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

try {
    $db = getDB();

    // Match your actual column names
    $stmt = $db->prepare("
        SELECT id, username, email, password_hash,
               level, is_vip, coins, usd_balance,
               today_earnings, today_earnings_date,
               is_verified as email_verified, 
               referral_code, country, streak
        FROM users WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Check if email is verified (using is_verified column)
    if ($user['email_verified'] == 0) {
        echo json_encode([
            'success'    => false,
            'message'    => 'Please verify your email first. Check your inbox.',
            'unverified' => true,
        ]);
        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    unset($user['password_hash']);

    // Reset today_earnings if it's a new day
    $today = date('Y-m-d');
    if (($user['today_earnings_date'] ?? '') !== $today) {
        $db->prepare("UPDATE users SET today_earnings = 0, today_earnings_date = ? WHERE id = ?")
           ->execute([$today, $user['id']]);
        $user['today_earnings'] = 0;
        $user['today_earnings_date'] = $today;
    }

    // Cast numeric fields
    $user['coins']          = (int)$user['coins'];
    $user['usd_balance']    = (float)$user['usd_balance'];
    $user['today_earnings'] = (int)$user['today_earnings'];
    $user['level']          = (int)$user['level'];
    $user['is_vip']         = (int)$user['is_vip'];
    $user['streak']         = (int)($user['streak'] ?? 1);

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user'    => $user,
    ]);
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}
?>