<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

$users = $db->query("
    SELECT
        id, username, email, country,
        level, is_vip, usd_balance, coins,
        COALESCE(account_status, 1)  AS account_status,
        COALESCE(deposit_status, 1)  AS deposit_status,
        COALESCE(withdraw_status, 1) AS withdraw_status,
        email_verified               AS is_verified,
        created_at
    FROM users
    ORDER BY id DESC
")->fetchAll(PDO::FETCH_ASSOC);

$users = array_map(function ($u) {
    return [
        'id'             => (int)$u['id'],
        'username'       => $u['username'],
        'email'          => $u['email'],
        'country'        => $u['country'] ?? '',
        'level'          => (int)$u['level'],
        'is_vip'         => (int)$u['is_vip'],
        'usd_balance'    => (float)$u['usd_balance'],
        'coins'          => (int)$u['coins'],
        'account_status' => (int)$u['account_status'],
        'deposit_status' => (int)$u['deposit_status'],
        'withdraw_status'=> (int)$u['withdraw_status'],
        'is_verified'    => (int)$u['is_verified'],
        'created_at'     => $u['created_at'],
    ];
}, $users);

echo json_encode(['success' => true, 'users' => $users]);
