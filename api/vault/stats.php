<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

function getSetting($db, $key, $default) {
    try { 
        $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1"); 
        $s->execute([$key]); 
        $v = $s->fetchColumn(); 
        return $v !== false ? $v : $default; 
    } catch (Exception $e) { 
        return $default; 
    }
}

function saveSetting($db, $key, $value) {
    try { 
        $db->prepare("INSERT INTO admin_settings (`key`,`value`) VALUES(?,?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$key, $value, $value]); 
    } catch (Exception $e) {}
}

// ── Get user ID for my_earned ────────────────────────────────────────────
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

// ── Create distributions table if it doesn't exist ──────────────────────
try {
    $db->exec("CREATE TABLE IF NOT EXISTS vault_distributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        cycle VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
        status ENUM('pending','paid') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(user_id), 
        INDEX(cycle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

// ── Get user's earned amount ─────────────────────────────────────────────
$myEarned = 0;
if ($userId > 0) {
    try {
        $cycle = date('Y-m');
        $s = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_distributions WHERE user_id=? AND cycle=? AND status='paid'");
        $s->execute([$userId, $cycle]);
        $myEarned = (float)$s->fetchColumn();
    } catch (Exception $e) {
        $myEarned = 0;
    }
}

// ── Pool stats ────────────────────────────────────────────────────────────
$totalXP = (int)$db->query("SELECT COALESCE(SUM(coins),0) FROM users")->fetchColumn();

// ✅ FIX: Sanitize month_revenue to prevent overflow
$monthRevenue = (float)getSetting($db, 'month_revenue', 0);
if ($monthRevenue > 999999999999 || $monthRevenue < 0) {
    $monthRevenue = 0;
    saveSetting($db, 'month_revenue', 0);
}

$unitPrice    = (float)getSetting($db, 'vault_unit_price', 15);

$totalUnits = 0;
try { 
    $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn(); 
} catch (Exception $e) {}

$currentValue = $totalUnits * $unitPrice;

// ── Snapshot logic for 24h change ───────────────────────────────────────
$todayKey     = 'vault_value_' . date('Y-m-d');
$yesterdayKey = 'vault_value_' . date('Y-m-d', strtotime('-1 day'));
saveSetting($db, $todayKey, $currentValue);
$prevValue = (float)getSetting($db, $yesterdayKey, 0);

// ── If requesting prev value for 24h change ─────────────────────────────
if (isset($_GET['prev']) && $_GET['prev'] == '1') {
    echo json_encode(['success' => true, 'prev_total_value' => $prevValue]);
    exit;
}

// ── Settings ──────────────────────────────────────────────────────────────
$openDay  = (int)getSetting($db, 'xp_open_day', 1);
$closeDay = (int)getSetting($db, 'xp_close_day', 25);
$distDay  = (int)getSetting($db, 'xp_dist_day', 28);
$minXp    = (int)getSetting($db, 'xp_min_contribution', 250);

// ── Response ──────────────────────────────────────────────────────────────
echo json_encode([
    'success'          => true,
    'total_xp'         => $totalXP,
    'month_revenue'    => $monthRevenue,
    'unit_price'       => $unitPrice,
    'total_units'      => $totalUnits,
    'prev_total_value' => $prevValue,
    'my_earned'        => $myEarned,
    'settings'         => [
        'open_day'  => $openDay,
        'close_day' => $closeDay,
        'dist_day'  => $distDay,
        'min_xp'    => $minXp,
    ],
]);
?>