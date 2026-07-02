<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true);
$userId   = (int)($input['user_id']  ?? 0);
$quantity = (int)($input['quantity'] ?? 1);
if ($quantity < 1) $quantity = 1;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'user_id required']);
    exit;
}

$db = getDB();

function getSetting($db, $key, $default) {
    try {
        $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1");
        $s->execute([$key]);
        $v = $s->fetchColumn();
        return $v !== false ? $v : $default;
    } catch (Exception $e) { return $default; }
}

$unitPrice  = (float)getSetting($db, 'vault_unit_price', 15);
$feePercent = (float)getSetting($db, 'vault_tx_fee',      2) / 100;

// Check units owned
$owned = 0;
try {
    $s = $db->prepare("SELECT COALESCE(quantity,0) FROM vault_units WHERE user_id=?");
    $s->execute([$userId]);
    $owned = (int)($s->fetchColumn() ?: 0);
} catch (Exception $e) {}

if ($owned === 0) {
    echo json_encode(['success' => false, 'message' => 'You have no vault units to sell']);
    exit;
}
if ($quantity > $owned) {
    echo json_encode(['success' => false, 'message' => "You only have {$owned} unit(s)"]);
    exit;
}

// Sell fee: same 2% deducted from payout, goes to vault pool
$grossPayout = round($unitPrice * $quantity, 4);
$feeAmount   = round($grossPayout * $feePercent, 4);
$netPayout   = round($grossPayout - $feeAmount, 2);

$db->beginTransaction();
try {
    // Credit net payout to user
    $db->prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id=?")->execute([$netPayout, $userId]);

    // Remove units
    $db->prepare("UPDATE vault_units SET quantity = quantity - ? WHERE user_id=?")->execute([$quantity, $userId]);

    // Fee goes to vault pool
    try {
        $db->prepare("INSERT INTO admin_settings (`key`,`value`) VALUES ('month_revenue',?) ON DUPLICATE KEY UPDATE `value` = `value` + ?")
           ->execute([$feeAmount, $feeAmount]);
    } catch (Exception $e) {}

    // Log wallet transaction
    $ref   = 'VAULT-SELL-' . strtoupper(substr(md5(uniqid()), 0, 8));
    $notes = json_encode([
        'reason'      => "Sold {$quantity} vault unit(s)",
        'unit_price'  => $unitPrice,
        'gross_payout'=> $grossPayout,
        'fee'         => $feeAmount,
        'net_payout'  => $netPayout,
    ]);
    try {
        $db->prepare("INSERT INTO wallet_transactions (user_id,type,amount,status,reference,notes,created_at) VALUES (?,'vault_sell',?,'completed',?,?,NOW())")
           ->execute([$userId, $netPayout, $ref, $notes]);
    } catch (Exception $e) {}

    $db->commit();

    $stmt = $db->prepare("SELECT usd_balance FROM users WHERE id=?");
    $stmt->execute([$userId]);
    $newBalance = (float)$stmt->fetchColumn();

    echo json_encode([
        'success'      => true,
        'message'      => "Sold {$quantity} unit" . ($quantity > 1 ? 's' : ''),
        'new_balance'  => $newBalance,
        'gross_payout' => $grossPayout,
        'fee_paid'     => $feeAmount,
        'net_payout'   => $netPayout,
    ]);

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
