<?php
header("Content-Type: application/json");
require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$transaction_id = $data['transaction_id'] ?? null;

if (!$transaction_id) {
    echo json_encode([
        "success" => false,
        "message" => "Transaction ID is required"
    ]);
    exit;
}

try {
    $db = getDB();

    // Get transaction
    $stmt = $db->prepare("
        SELECT * FROM wallet_transactions 
        WHERE id = ? AND type = 'withdrawal' AND status = 'pending'
    ");
    $stmt->execute([$transaction_id]);
    $transaction = $stmt->fetch();

    if (!$transaction) {
        echo json_encode([
            "success" => false,
            "message" => "Withdrawal request not found"
        ]);
        exit;
    }

    // Get user balance
    $stmt = $db->prepare("SELECT usd_balance FROM users WHERE id = ?");
    $stmt->execute([$transaction['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
        exit;
    }

    if ($transaction['amount'] > $user['usd_balance']) {
        echo json_encode([
            "success" => false,
            "message" => "User balance is no longer sufficient"
        ]);
        exit;
    }

    // Deduct balance
    $newBalance = $user['usd_balance'] - $transaction['amount'];

    $updateUser = $db->prepare("
        UPDATE users SET usd_balance = ? WHERE id = ?
    ");
    $updateUser->execute([$newBalance, $transaction['user_id']]);

    // Mark transaction completed
    $updateTransaction = $db->prepare("
        UPDATE wallet_transactions 
        SET status = 'completed'
        WHERE id = ?
    ");
    $updateTransaction->execute([$transaction_id]);

    echo json_encode([
        "success" => true,
        "message" => "Withdrawal approved and balance deducted"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>