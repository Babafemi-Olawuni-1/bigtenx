<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$userId = (int)($_GET['user_id'] ?? 0);
if (!$userId) { echo json_encode(['success'=>false,'message'=>'user_id required']); exit; }

$db = getDB();

// Ensure tables exist
try {
    $db->exec("CREATE TABLE IF NOT EXISTS vault_contributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        cycle VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(user_id), INDEX(cycle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS vault_units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        UNIQUE KEY(user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

$cycle = date('Y-m');

$contrib = 0;
try {
    $s = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_contributions WHERE user_id=? AND cycle=?");
    $s->execute([$userId, $cycle]);
    $contrib = (int)$s->fetchColumn();
} catch (Exception $e) {}

$units = 0;
try {
    $s = $db->prepare("SELECT COALESCE(quantity,0) FROM vault_units WHERE user_id=?");
    $s->execute([$userId]);
    $units = (int)($s->fetchColumn() ?: 0);
} catch (Exception $e) {}

$totalUnits = 0;
try {
    $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn();
} catch (Exception $e) {}

$unitPrice = 15;
try {
    $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`='vault_unit_price' LIMIT 1");
    $s->execute();
    $v = $s->fetchColumn();
    if ($v) $unitPrice = (float)$v;
} catch (Exception $e) {}

$basicLimit = 2;
try {
    $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`='vault_basic_limit' LIMIT 1");
    $s->execute();
    $v = $s->fetchColumn();
    if ($v) $basicLimit = (int)$v;
} catch (Exception $e) {}

$txFee = 2;
try {
    $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`='vault_tx_fee' LIMIT 1");
    $s->execute();
    $v = $s->fetchColumn();
    if ($v) $txFee = (float)$v;
} catch (Exception $e) {}

echo json_encode([
    'success'          => true,
    'my_contribution'  => $contrib,
    'my_units'         => $units,
    'total_units'      => $totalUnits,
    'unit_price'       => $unitPrice,
    'basic_limit'      => $basicLimit,
    'tx_fee'           => $txFee,
]);
?>
