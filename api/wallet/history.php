<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) { echo json_encode(["success" => false, "message" => "User ID is required"]); exit; }

try {
    $db = getDB();

    // Detect available columns
    $hasNotes = true;
    try { $db->query("SELECT notes FROM wallet_transactions LIMIT 1"); }
    catch (Exception $e) { $hasNotes = false; }

    $notesSel = $hasNotes ? ", notes" : "";

    $stmt = $db->prepare("
        SELECT
            id, type, amount, status, reference,
            bank_name, account_name, account_number,
            created_at
            {$notesSel}
        FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse notes JSON for each transaction to extract reason
    foreach ($transactions as &$tx) {
        $notes = $tx['notes'] ?? null;
        if ($notes) {
            $decoded = json_decode($notes, true);
            if (is_array($decoded)) {
                $tx['reason']   = $decoded['reason']   ?? null;
                $tx['currency'] = $decoded['currency'] ?? null;
                $tx['rate_used']= $decoded['rate_used'] ?? null;
                $tx['network']  = $decoded['network']   ?? null;
                $tx['wallet_address'] = $decoded['wallet_address'] ?? null;
            }
        }
        unset($tx['notes']); // don't expose raw JSON
    }
    unset($tx);

    echo json_encode(["success" => true, "transactions" => $transactions]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
