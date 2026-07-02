<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

$totalXP = (int)$db->query("SELECT COALESCE(SUM(coins),0) FROM users")->fetchColumn();

$monthRevenue = 0;
try {
    $monthRevenue = (float)$db->query("SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='completed' AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())")->fetchColumn();
} catch (Exception $e) {}

try {
    $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`='month_revenue' LIMIT 1");
    $s->execute();
    $row = $s->fetch(PDO::FETCH_ASSOC);
    if ($row) $monthRevenue = (float)$row['value'];
} catch (Exception $e) {}

$unitPrice  = 15.0;
$totalUnits = 0;
try {
    $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`='vault_unit_price' LIMIT 1");
    $s->execute(); $v = $s->fetchColumn();
    if ($v) $unitPrice = (float)$v;
} catch (Exception $e) {}

try {
    $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn();
} catch (Exception $e) {}

echo json_encode([
    'success'       => true,
    'total_xp'      => $totalXP,
    'month_revenue' => $monthRevenue,
    'unit_price'    => $unitPrice,
    'total_units'   => $totalUnits,
]);
?>
