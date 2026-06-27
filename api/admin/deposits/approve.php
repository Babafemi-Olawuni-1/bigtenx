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

    $stmt = $db->prepare("
        SELECT * FROM wallet_transactions
        WHERE id = ? AND type = 'deposit' AND status = 'pending'
    ");
    $stmt->execute([$transaction_id]);
    $transaction = $stmt->fetch();

    if (!$transaction) {
        echo json_encode([
            "success" => false,
            "message" => "Deposit request not found"
        ]);
        exit;
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$transaction['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
        exit;
    }

    $currentBalance = (float)$user['usd_balance'];
    $depositAmount = (float)$transaction['amount'];
    $newBalance = $currentBalance + $depositAmount;

    $updateUser = $db->prepare("
        UPDATE users SET usd_balance = ? WHERE id = ?
    ");
    $updateUser->execute([$newBalance, $transaction['user_id']]);

    $updateTransaction = $db->prepare("
        UPDATE wallet_transactions
        SET status = 'completed'
        WHERE id = ?
    ");
    $updateTransaction->execute([$transaction_id]);

    echo json_encode([
        "success" => true,
        "message" => "Deposit approved successfully"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>