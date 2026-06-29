<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

// Verify admin token
$token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
if (strlen($token) < 10) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$userId = (int)($input['user_id'] ?? 0);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'user_id required']);
    exit;
}

$db = getDB();

// Fetch current balance
$stmt = $db->prepare("SELECT usd_balance, coins FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$currentBalance = (float)$user['usd_balance'];

switch ($action) {

    case 'credit':
        $amount = (float)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? 'Admin credit');
        if ($amount <= 0) {
            echo json_encode(['success' => false, 'message' => 'Amount must be greater than 0']);
            exit;
        }
        $newBalance = $currentBalance + $amount;
        $db->prepare("UPDATE users SET usd_balance = ? WHERE id = ?")->execute([$newBalance, $userId]);

        // Log transaction
        try {
            $ref = 'ADMIN-CREDIT-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $db->prepare("
                INSERT INTO wallet_transactions (user_id, type, amount, status, reference, created_at)
                VALUES (?, 'admin_credit', ?, 'completed', ?, NOW())
            ")->execute([$userId, $amount, $ref]);
        } catch (Exception $e) {}

        echo json_encode([
            'success'     => true,
            'message'     => "Successfully credited \${$amount}",
            'new_balance' => $newBalance,
        ]);
        break;

    case 'debit':
        $amount = (float)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? 'Admin debit');
        if ($amount <= 0) {
            echo json_encode(['success' => false, 'message' => 'Amount must be greater than 0']);
            exit;
        }
        if ($amount > $currentBalance) {
            echo json_encode(['success' => false, 'message' => 'Insufficient balance to debit']);
            exit;
        }
        $newBalance = $currentBalance - $amount;
        $db->prepare("UPDATE users SET usd_balance = ? WHERE id = ?")->execute([$newBalance, $userId]);

        // Log transaction
        try {
            $ref = 'ADMIN-DEBIT-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $db->prepare("
                INSERT INTO wallet_transactions (user_id, type, amount, status, reference, created_at)
                VALUES (?, 'admin_debit', ?, 'completed', ?, NOW())
            ")->execute([$userId, $amount, $ref]);
        } catch (Exception $e) {}

        echo json_encode([
            'success'     => true,
            'message'     => "Successfully debited \${$amount}",
            'new_balance' => $newBalance,
        ]);
        break;

    case 'freeze':
        $db->prepare("UPDATE users SET deposit_status = 0, withdraw_status = 0 WHERE id = ?")->execute([$userId]);
        echo json_encode(['success' => true, 'message' => 'Wallet frozen — deposits and withdrawals disabled']);
        break;

    case 'unfreeze':
        $db->prepare("UPDATE users SET deposit_status = 1, withdraw_status = 1 WHERE id = ?")->execute([$userId]);
        echo json_encode(['success' => true, 'message' => 'Wallet unfrozen — deposits and withdrawals enabled']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Unknown action. Use: credit, debit, freeze, unfreeze']);
        break;
}
