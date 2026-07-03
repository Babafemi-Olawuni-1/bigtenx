<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$userId = (int)($_GET['user_id'] ?? 0);
if (!$userId) { echo json_encode(['success'=>false,'message'=>'user_id required']); exit; }

$db = getDB();

try {
    // Check notes column exists
    $hasNotes = true;
    try { $db->query("SELECT notes FROM wallet_transactions LIMIT 1"); }
    catch (Exception $e) { $hasNotes = false; }

    $notesSel = $hasNotes ? ", notes" : "";

    $stmt = $db->prepare("
        SELECT id, type, amount, status, reference, created_at {$notesSel}
        FROM wallet_transactions
        WHERE user_id = ? AND type IN ('vault_buy','vault_sell','vault_distribution')
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse notes JSON into notes_parsed
    foreach ($rows as &$row) {
        if ($hasNotes && !empty($row['notes'])) {
            $decoded = json_decode($row['notes'], true);
            $row['notes_parsed'] = is_array($decoded) ? $decoded : [];
        } else {
            $row['notes_parsed'] = [];
        }
        unset($row['notes']);
    }
    unset($row);

    echo json_encode(['success' => true, 'transactions' => $rows]);

} catch (Exception $e) {
    echo json_encode(['success' => true, 'transactions' => [], 'error' => $e->getMessage()]);
}
?>
