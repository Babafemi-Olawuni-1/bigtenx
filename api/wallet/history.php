<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required"
    ]);
    exit;
}

try {
    $db = getDB();

    $stmt = $db->prepare("
        SELECT 
            id,
            type,
            amount,
            status,
            reference,
            created_at
        FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");

    $stmt->execute([$user_id]);
    $transactions = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "transactions" => $transactions
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>