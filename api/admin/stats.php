<?php
ini_set('display_errors', 0);
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db = getDB();

$stats = [
    'total_users'    => (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    'verified_users' => (int)$db->query("SELECT COUNT(*) FROM users WHERE is_verified=1")->fetchColumn(),
    'paid_users'     => (int)$db->query("SELECT COUNT(*) FROM users WHERE level_paid=1")->fetchColumn(),
    'total_xp'       => (int)$db->query("SELECT SUM(coins) FROM users")->fetchColumn(),
    'active_tasks'   => (int)$db->query("SELECT COUNT(*) FROM admin_tasks WHERE active=1")->fetchColumn(),
    'task_completions'=> (int)$db->query("SELECT COUNT(*) FROM task_completions")->fetchColumn(),
    'level_breakdown'=> $db->query("SELECT level, COUNT(*) as cnt FROM users GROUP BY level ORDER BY level")->fetchAll(),
    'recent_users'   => $db->query("SELECT id,username,email,country,level,coins,created_at FROM users ORDER BY created_at DESC LIMIT 10")->fetchAll(),
];

echo json_encode(['success' => true, 'stats' => $stats]);
