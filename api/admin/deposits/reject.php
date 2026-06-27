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

    $stmt = $db->prepare("
        UPDATE wallet_transactions
        SET status = 'rejected', admin_note = ?
        WHERE id = ? AND type = 'deposit'
    ");

    $stmt->execute([$admin_note, $transaction_id]);

    echo json_encode([
        "success" => true,
        "message" => "Deposit rejected successfully"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>