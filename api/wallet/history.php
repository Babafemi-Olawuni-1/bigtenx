<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
    exit;
}

try {
    $db = getDB();

    // Safely fetch notes column (may not exist on older schemas)
    $hasNotes = true;
    try { $db->query("SELECT notes FROM wallet_transactions LIMIT 1"); }
    catch (Exception $e) { $hasNotes = false; }

    $cols = "id, type, amount, status, reference, bank_name, account_name, account_number, created_at";
    if ($hasNotes) $cols .= ", notes";

    $stmt = $db->prepare("
        SELECT {$cols}
        FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "transactions" => $transactions]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
