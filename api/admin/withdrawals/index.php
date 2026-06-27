<?php
header("Content-Type: application/json");
require_once "../../config/db.php";

try {
    $db = getDB();

    $stmt = $db->query("
        SELECT 
            wt.id,
            wt.user_id,
            wt.amount,
            wt.bank_name,
            wt.account_name,
            wt.account_number,
            wt.status,
            wt.reference,
            wt.created_at,
            u.username,
            u.email
        FROM wallet_transactions wt
        JOIN users u ON wt.user_id = u.id
        WHERE wt.type = 'withdrawal'
        ORDER BY wt.created_at DESC
    ");

    $withdrawals = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "withdrawals" => $withdrawals
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>