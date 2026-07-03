<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

function getSetting($db, $key, $default) {
    try { $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1"); $s->execute([$key]); $v = $s->fetchColumn(); return $v !== false ? $v : $default; }
    catch (Exception $e) { return $default; }
}
function saveSetting($db, $key, $value) {
    try { $db->prepare("INSERT INTO admin_settings (`key`,`value`) VALUES(?,?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$key,$value,$value]); } catch (Exception $e) {}
}

$totalXP = (int)$db->query("SELECT COALESCE(SUM(coins),0) FROM users")->fetchColumn();

$monthRevenue = (float)getSetting($db, 'month_revenue', 0);
$unitPrice    = (float)getSetting($db, 'vault_unit_price', 15);

$totalUnits = 0;
try { $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn(); } catch (Exception $e) {}

$currentValue = $totalUnits * $unitPrice;

// Snapshot logic: save today's value once per day, return yesterday's for 24h diff
$todayKey     = 'vault_value_' . date('Y-m-d');
$yesterdayKey = 'vault_value_' . date('Y-m-d', strtotime('-1 day'));
saveSetting($db, $todayKey, $currentValue);
$prevValue = (float)getSetting($db, $yesterdayKey, 0);

// If requesting prev value for 24h change
$returnPrev = isset($_GET['prev']) && $_GET['prev'] == '1';
if ($returnPrev) {
    echo json_encode(['success' => true, 'prev_total_value' => $prevValue]);
    exit;
}

$openDay  = (int)getSetting($db, 'xp_open_day', 1);
$closeDay = (int)getSetting($db, 'xp_close_day', 25);
$distDay  = (int)getSetting($db, 'xp_dist_day', 28);
$minXp    = (int)getSetting($db, 'xp_min_contribution', 250);

echo json_encode([
    'success'          => true,
    'total_xp'         => $totalXP,
    'month_revenue'    => $monthRevenue,
    'unit_price'       => $unitPrice,
    'total_units'      => $totalUnits,
    'prev_total_value' => $prevValue,
    'settings'         => [
        'open_day'  => $openDay,
        'close_day' => $closeDay,
        'dist_day'  => $distDay,
        'min_xp'    => $minXp,
    ],
]);
?>
