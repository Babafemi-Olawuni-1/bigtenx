<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

// Total XP across all users
$totalXP = (int)$db->query("SELECT COALESCE(SUM(coins), 0) FROM users")->fetchColumn();

// This month's revenue: sum of upgrade payments this calendar month
// Falls back to 0 if the table/column doesn't exist yet
$monthRevenue = 0;
try {
    $monthRevenue = (float)$db->query("
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE status = 'completed'
          AND MONTH(created_at) = MONTH(NOW())
          AND YEAR(created_at)  = YEAR(NOW())
    ")->fetchColumn();
} catch (Exception $e) {
    // payments table may not exist yet — return 0
    $monthRevenue = 0;
}

// Admin-set monthly revenue override (from admin_settings table)
try {
    $stmt = $db->prepare("SELECT value FROM admin_settings WHERE `key` = 'month_revenue' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $monthRevenue = (float)$row['value'];
    }
} catch (Exception $e) {
    // admin_settings table may not exist yet
}

echo json_encode([
    'success'       => true,
    'total_xp'      => $totalXP,
    'month_revenue' => $monthRevenue,
]);
