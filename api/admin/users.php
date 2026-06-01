<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

$users = $db->query("SELECT id, username, email, level, is_vip, coins, usd_balance, created_at FROM users ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'users' => $users]);