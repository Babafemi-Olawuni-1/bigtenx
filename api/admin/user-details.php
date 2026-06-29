<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$db = getDB();

// ── GET: fetch user details ────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = (int)($_GET['user_id'] ?? 0);
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'user_id required']);
        exit;
    }

    // Exact columns that exist in the DB
    $stmt = $db->prepare("
        SELECT
            id, username, email, country,
            level, is_vip, usd_balance, coins,
            today_earnings, today_earnings_date,
            referral_code, referred_by, streak,
            email_verified,
            account_status, deposit_status, withdraw_status,
            created_at
        FROM users WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Sponsor username
    $sponsor = null;
    if (!empty($user['referred_by'])) {
        try {
            $ss = $db->prepare("SELECT username FROM users WHERE id = ?");
            $ss->execute([$user['referred_by']]);
            $sponsor = $ss->fetchColumn() ?: null;
        } catch (Exception $e) {}
    }

    // Badge + multiplier (safe — table may not exist)
    $current_badge      = null;
    $current_multiplier = 1.0;
    try {
        $bs = $db->prepare("
            SELECT b.name, b.xp_multiplier
            FROM user_badges ub
            JOIN badges b ON b.id = ub.badge_id
            WHERE ub.user_id = ?
            ORDER BY b.xp_multiplier DESC
            LIMIT 1
        ");
        $bs->execute([$userId]);
        $badge = $bs->fetch(PDO::FETCH_ASSOC);
        if ($badge) {
            $current_badge      = $badge['name'];
            $current_multiplier = (float)$badge['xp_multiplier'];
        }
    } catch (Exception $e) {}

    // Total deposits (completed)
    $total_deposits = 0;
    try {
        $ds = $db->prepare("
            SELECT COALESCE(SUM(amount), 0)
            FROM wallet_transactions
            WHERE user_id = ? AND type = 'deposit' AND status = 'completed'
        ");
        $ds->execute([$userId]);
        $total_deposits = (float)$ds->fetchColumn();
    } catch (Exception $e) {}

    // Total withdrawals (completed)
    $total_withdrawals = 0;
    try {
        $ws = $db->prepare("
            SELECT COALESCE(SUM(amount), 0)
            FROM wallet_transactions
            WHERE user_id = ? AND type = 'withdrawal' AND status = 'completed'
        ");
        $ws->execute([$userId]);
        $total_withdrawals = (float)$ws->fetchColumn();
    } catch (Exception $e) {}

    // Referral earnings (from referral_commissions if table exists)
    $referral_earnings = 0;
    try {
        $re = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM referral_commissions WHERE referrer_id = ?");
        $re->execute([$userId]);
        $referral_earnings = (float)$re->fetchColumn();
    } catch (Exception $e) {}

    // Referral stats
    $referral_count   = 0;
    $active_referrals = 0;
    $vip_referrals    = 0;
    $referral_list    = [];
    try {
        $rc = $db->prepare("SELECT COUNT(*) FROM users WHERE referred_by = ?");
        $rc->execute([$userId]);
        $referral_count = (int)$rc->fetchColumn();

        // "active" = has paid level (is_vip = 1 OR level > 1)
        $ra = $db->prepare("SELECT COUNT(*) FROM users WHERE referred_by = ? AND (is_vip = 1 OR level > 1)");
        $ra->execute([$userId]);
        $active_referrals = (int)$ra->fetchColumn();

        $rv = $db->prepare("SELECT COUNT(*) FROM users WHERE referred_by = ? AND is_vip = 1");
        $rv->execute([$userId]);
        $vip_referrals = (int)$rv->fetchColumn();

        $rl = $db->prepare("
            SELECT id, username, level, is_vip, created_at
            FROM users WHERE referred_by = ?
            ORDER BY created_at DESC LIMIT 50
        ");
        $rl->execute([$userId]);
        $referral_list = $rl->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {}

    // Total commissions
    $total_commissions = 0;
    try {
        $tc = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM referral_commissions WHERE referrer_id = ?");
        $tc->execute([$userId]);
        $total_commissions = (float)$tc->fetchColumn();
    } catch (Exception $e) {}

    // Recent wallet history
    $wallet_history = [];
    try {
        $wh = $db->prepare("
            SELECT id, type, amount, status, reference, created_at
            FROM wallet_transactions
            WHERE user_id = ?
            ORDER BY created_at DESC LIMIT 30
        ");
        $wh->execute([$userId]);
        $wallet_history = $wh->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {}

    echo json_encode([
        'success' => true,
        'user' => [
            'id'                 => (int)$user['id'],
            'username'           => $user['username'],
            'email'              => $user['email'],
            'country'            => $user['country'] ?? '',
            'level'              => (int)$user['level'],
            'is_vip'             => (int)$user['is_vip'],
            'usd_balance'        => (float)$user['usd_balance'],
            'coins'              => (int)$user['coins'],
            'today_earnings'     => (int)($user['today_earnings'] ?? 0),
            'today_earnings_cash'=> 0, // column doesn't exist yet
            'referral_earnings'  => $referral_earnings,
            'referral_code'      => $user['referral_code'] ?? '',
            'referred_by'        => $user['referred_by'],
            'sponsor'            => $sponsor,
            'streak'             => (int)($user['streak'] ?? 0),
            'account_status'     => (int)($user['account_status'] ?? 1),
            'deposit_status'     => (int)($user['deposit_status'] ?? 1),
            'withdraw_status'    => (int)($user['withdraw_status'] ?? 1),
            'is_verified'        => (int)($user['email_verified'] ?? 0),
            'current_badge'      => $current_badge,
            'current_multiplier' => $current_multiplier,
            'total_deposits'     => $total_deposits,
            'total_withdrawals'  => $total_withdrawals,
            'created_at'         => $user['created_at'],
        ],
        'referrals' => [
            'referral_count'    => $referral_count,
            'active_referrals'  => $active_referrals,
            'vip_referrals'     => $vip_referrals,
            'total_commissions' => $total_commissions,
            'referral_list'     => $referral_list,
        ],
        'wallet_history' => $wallet_history,
    ]);
    exit;
}

// ── POST: update account settings ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (strlen($token) < 10) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $input  = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['user_id'] ?? 0);
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'user_id required']);
        exit;
    }

    $action = $input['action'] ?? 'update_settings';

    if ($action === 'update_settings') {
        $sets   = [];
        $params = [];

        // Only update columns that actually exist
        if (isset($input['account_status'])) {
            $sets[]   = 'account_status = ?';
            $params[] = (int)$input['account_status'];
        }
        if (isset($input['deposit_status'])) {
            $sets[]   = 'deposit_status = ?';
            $params[] = (int)$input['deposit_status'];
        }
        if (isset($input['withdraw_status'])) {
            $sets[]   = 'withdraw_status = ?';
            $params[] = (int)$input['withdraw_status'];
        }
        if (isset($input['is_verified'])) {
            // Map frontend is_verified → email_verified column
            $sets[]   = 'email_verified = ?';
            $params[] = (int)$input['is_verified'];
        }

        if (empty($sets)) {
            echo json_encode(['success' => false, 'message' => 'Nothing to update']);
            exit;
        }

        $params[] = $userId;
        $stmt = $db->prepare("UPDATE users SET " . implode(', ', $sets) . " WHERE id = ?");
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Settings saved successfully']);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown action']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed']);
