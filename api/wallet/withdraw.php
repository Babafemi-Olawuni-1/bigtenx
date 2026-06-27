<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$amount = $data['amount'] ?? null;
$bank_name = $data['bank_name'] ?? null;
$account_name = $data['account_name'] ?? null;
$account_number = $data['account_number'] ?? null;

if (!$user_id || !$amount || !$bank_name || !$account_name || !$account_number) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

if ($amount < 3) {
    echo json_encode([
        "success" => false,
        "message" => "Minimum withdrawal is $3"
    ]);
    exit;
}

try {
    $db = getDB();

    // Check user balance
    $stmt = $db->prepare("SELECT usd_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
        exit;
    }

    if ($amount > $user['usd_balance']) {
        echo json_encode([
            "success" => false,
            "message" => "Insufficient balance"
        ]);
        exit;
    }

    // Save withdrawal request only (NO deduction yet)
    $reference = "WDR-" . time() . rand(100, 999);

    $insert = $db->prepare("
        INSERT INTO wallet_transactions
        (user_id, type, amount, bank_name, account_name, account_number, status, reference)
        VALUES (?, 'withdrawal', ?, ?, ?, ?, 'pending', ?)
    ");

    $insert->execute([
        $user_id,
        $amount,
        $bank_name,
        $account_name,
        $account_number,
        $reference
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Withdrawal request submitted successfully",
        "reference" => $reference
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>