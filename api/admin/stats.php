<?php
ini_set('display_errors', 0);
error_reporting(0);
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db = getDB();

function safeVal($db, $sql, $default = 0) {
    try {
        $r = $db->query($sql)->fetchColumn();
        return $r === false ? $default : $r;
    } catch (Exception $e) { return $default; }
}

function safeRows($db, $sql, $default = []) {
    try {
        return $db->query($sql)->fetchAll(PDO::FETCH_ASSOC) ?: $default;
    } catch (Exception $e) { return $default; }
}

// ── Core user stats (using only real columns) ──────────────────────────────
$total_users    = (int)safeVal($db, "SELECT COUNT(*) FROM users");
$verified_users = (int)safeVal($db, "SELECT COUNT(*) FROM users WHERE email_verified = 1");
$vip_users      = (int)safeVal($db, "SELECT COUNT(*) FROM users WHERE is_vip = 1");
$paid_users     = (int)safeVal($db, "SELECT COUNT(*) FROM users WHERE level > 1");
$total_xp       = (int)safeVal($db, "SELECT COALESCE(SUM(coins),0) FROM users");

// ── Task stats ─────────────────────────────────────────────────────────────
$active_tasks     = (int)safeVal($db, "SELECT COUNT(*) FROM admin_tasks WHERE active = 1");
$task_completions = (int)safeVal($db, "SELECT COUNT(*) FROM task_completions");

// ── Deposit stats ──────────────────────────────────────────────────────────
$total_deposited   = (float)safeVal($db, "SELECT COALESCE(SUM(amount),0) FROM wallet_transactions WHERE type='deposit' AND status='completed'", 0);
$pending_deposits  = (int)safeVal($db, "SELECT COUNT(*) FROM wallet_transactions WHERE type='deposit' AND status='pending'");
$rejected_deposits = (int)safeVal($db, "SELECT COUNT(*) FROM wallet_transactions WHERE type='deposit' AND status='rejected'");
// Deposit fees: approximate 1.5% of completed deposits
$deposit_fees = round($total_deposited * 0.015, 2);

// ── Withdrawal stats ───────────────────────────────────────────────────────
$total_withdrawn    = (float)safeVal($db, "SELECT COALESCE(SUM(amount),0) FROM wallet_transactions WHERE type='withdrawal' AND status='completed'", 0);
$pending_withdrawals= (int)safeVal($db, "SELECT COUNT(*) FROM wallet_transactions WHERE type='withdrawal' AND status='pending'");
$rejected_withdrawals=(int)safeVal($db, "SELECT COUNT(*) FROM wallet_transactions WHERE type='withdrawal' AND status='rejected'");
// Withdrawal fees: approximate 2% of completed withdrawals
$withdrawal_fees = round($total_withdrawn * 0.02, 2);

// ── Revenue from admin_settings ───────────────────────────────────────────
$revenue = 0;
try {
    $rev = $db->query("SELECT value FROM admin_settings WHERE `key` = 'month_revenue' LIMIT 1");
    $revenue = (float)($rev->fetchColumn() ?: 0);
} catch (Exception $e) {}

// ── Level breakdown ────────────────────────────────────────────────────────
$level_breakdown = safeRows($db, "SELECT level, COUNT(*) as cnt FROM users GROUP BY level ORDER BY level");

// ── Recent signups ─────────────────────────────────────────────────────────
$recent_users = safeRows($db,
    "SELECT id, username, email, country, level, coins, created_at
     FROM users ORDER BY created_at DESC LIMIT 10"
);

echo json_encode([
    'success' => true,
    'stats' => [
        'total_users'          => $total_users,
        'verified_users'       => $verified_users,
        'paid_users'           => $paid_users,
        'vip_users'            => $vip_users,
        'total_xp'             => $total_xp,
        'active_tasks'         => $active_tasks,
        'task_completions'     => $task_completions,
        'revenue'              => $revenue,
        // deposits
        'total_deposited'      => $total_deposited,
        'pending_deposits'     => $pending_deposits,
        'rejected_deposits'    => $rejected_deposits,
        'deposit_fees'         => $deposit_fees,
        // withdrawals
        'total_withdrawn'      => $total_withdrawn,
        'pending_withdrawals'  => $pending_withdrawals,
        'rejected_withdrawals' => $rejected_withdrawals,
        'withdrawal_fees'      => $withdrawal_fees,
        // breakdown
        'level_breakdown'      => $level_breakdown,
        'recent_users'         => $recent_users,
    ],
]);
