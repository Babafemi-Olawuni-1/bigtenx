<?php
header("Content-Type: application/json");
require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$transaction_id = $data['transaction_id'] ?? null;
$admin_note = $data['admin_note'] ?? 'Rejected by admin';

if (!$transaction_id) {
    echo json_encode([
        "success" => false,
        "message" => "Transaction ID is required"
    ]);
    exit;
}

try {
    $db = getDB();

    // Check transaction
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

    // Reject transaction
    $update = $db->prepare("
        UPDATE wallet_transactions
        SET status = 'rejected', admin_note = ?
        WHERE id = ?
    ");
    $update->execute([$admin_note, $transaction_id]);

    echo json_encode([
        "success" => true,
        "message" => "Withdrawal rejected successfully"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>