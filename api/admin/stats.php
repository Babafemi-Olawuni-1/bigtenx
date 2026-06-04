<?php
ini_set('display_errors', 0);
error_reporting(0);
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db = getDB();

// Helper: safely run a query and return a single column value
function safeCount($db, $sql, $default = 0) {
    try {
        $result = $db->query($sql)->fetchColumn();
        return $result === false ? $default : (int)$result;
    } catch (Exception $e) {
        return $default;
    }
}

function safeQuery($db, $sql, $default = []) {
    try {
        return $db->query($sql)->fetchAll(PDO::FETCH_ASSOC) ?: $default;
    } catch (Exception $e) {
        return $default;
    }
}

$stats = [
    'total_users'      => safeCount($db, "SELECT COUNT(*) FROM users"),
    'verified_users'   => safeCount($db, "SELECT COUNT(*) FROM users WHERE is_verified = 1"),
    'paid_users'       => safeCount($db, "SELECT COUNT(*) FROM users WHERE level_paid = 1"),
    'total_xp'         => safeCount($db, "SELECT COALESCE(SUM(coins), 0) FROM users"),
    'active_tasks'     => safeCount($db, "SELECT COUNT(*) FROM admin_tasks WHERE active = 1"),
    'task_completions' => safeCount($db, "SELECT COUNT(*) FROM task_completions"),
    'level_breakdown'  => safeQuery($db, "SELECT level, COUNT(*) as cnt FROM users GROUP BY level ORDER BY level"),
    'recent_users'     => safeQuery($db, "SELECT id, username, email, country, level, coins, created_at FROM users ORDER BY created_at DESC LIMIT 10"),
];

echo json_encode(['success' => true, 'stats' => $stats]);
