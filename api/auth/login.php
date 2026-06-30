<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

try {
    $db = getDB();

    $stmt = $db->prepare("
        SELECT id, username, email, password_hash,
               level, is_vip, coins, usd_balance,
               today_earnings, today_earnings_date,
               is_verified as email_verified,
               referral_code, country, streak
        FROM users WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Safely fetch optional columns that may not exist in older schemas
    $optionalCols = ['today_earnings_cash', 'last_task_date'];
    foreach ($optionalCols as $col) {
        if (!array_key_exists($col, $user)) {
            try {
                $oc = $db->prepare("SELECT `$col` FROM users WHERE id = ?");
                $oc->execute([$user['id']]);
                $ocRow = $oc->fetch(PDO::FETCH_ASSOC);
                $user[$col] = $ocRow[$col] ?? null;
            } catch (Exception $e) {
                $user[$col] = null; // column doesn't exist
            }
        }
    }

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    if ($user['email_verified'] == 0) {
        echo json_encode([
            'success'    => false,
            'message'    => 'Please verify your email first. Check your inbox.',
            'unverified' => true,
        ]);
        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    unset($user['password_hash']);

    // Reset today_earnings if it's a new day
    $today = date('Y-m-d');
    if (($user['today_earnings_date'] ?? '') !== $today) {
        try {
            $db->prepare("
                UPDATE users
                SET today_earnings = 0, today_earnings_cash = 0, today_earnings_date = ?
                WHERE id = ?
            ")->execute([$today, $user['id']]);
        } catch (Exception $e) {
            // today_earnings_cash column may not exist yet
            $db->prepare("
                UPDATE users SET today_earnings = 0, today_earnings_date = ? WHERE id = ?
            ")->execute([$today, $user['id']]);
        }
        $user['today_earnings']      = 0;
        $user['today_earnings_cash'] = 0;
        $user['today_earnings_date'] = $today;
    }

    // Cast numeric fields
    $user['coins']                = (int)$user['coins'];
    $user['usd_balance']          = (float)$user['usd_balance'];
    $user['today_earnings']       = (int)$user['today_earnings'];
    $user['today_earnings_cash']  = (float)($user['today_earnings_cash'] ?? 0);
    $user['level']                = (int)$user['level'];
    $user['is_vip']               = (int)$user['is_vip'];
    $user['streak']               = (int)($user['streak'] ?? 0);

    // ── Weekly streak data ────────────────────────────────────────────
    try {
        $ws = $db->prepare("SELECT weekly_claimed_days, weekly_start FROM users WHERE id = ?");
        $ws->execute([$user['id']]);
        $wrow = $ws->fetch(PDO::FETCH_ASSOC);
        $user['weekly_claimed_days'] = $wrow['weekly_claimed_days'] ?? '';
        $user['weekly_start']        = $wrow['weekly_start'] ?? '';
    } catch (Exception $e) {
        $user['weekly_claimed_days'] = '';
        $user['weekly_start']        = '';
    }

    // ── Safely fetch optional columns that may not exist yet ──────
    // total_referrals — derive from referred_by count if column missing
    try {
        $rc = $db->prepare("SELECT total_referrals FROM users WHERE id = ?");
        $rc->execute([$user['id']]);
        $row = $rc->fetch(PDO::FETCH_ASSOC);
        $user['total_referrals'] = (int)($row['total_referrals'] ?? 0);
    } catch (Exception $e) {
        // Column missing — count dynamically
        try {
            $rc = $db->prepare("SELECT COUNT(*) FROM users WHERE referred_by = ?");
            $rc->execute([$user['id']]);
            $user['total_referrals'] = (int)$rc->fetchColumn();
        } catch (Exception $e2) {
            $user['total_referrals'] = 0;
        }
    }

    // referral_earnings — sum from referral_commissions if column missing
    try {
        $re = $db->prepare("SELECT referral_earnings FROM users WHERE id = ?");
        $re->execute([$user['id']]);
        $row = $re->fetch(PDO::FETCH_ASSOC);
        $user['referral_earnings'] = (float)($row['referral_earnings'] ?? 0);
    } catch (Exception $e) {
        try {
            $re = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM referral_commissions WHERE referrer_id = ?");
            $re->execute([$user['id']]);
            $user['referral_earnings'] = (float)$re->fetchColumn();
        } catch (Exception $e2) {
            $user['referral_earnings'] = 0;
        }
    }

    // ── Resolve plan name from level ──────────────────────────────
    $levelNames = [1 => 'Bronze', 2 => 'Silver', 3 => 'Gold', 4 => 'Diamond'];
    $user['plan_name'] = $levelNames[$user['level']] ?? 'Bronze';

    // ── Fetch highest owned badge (current_badge + multiplier) ────
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
        $bs->execute([$user['id']]);
        $badge = $bs->fetch(PDO::FETCH_ASSOC);
        if ($badge) {
            $current_badge      = $badge['name'];
            $current_multiplier = (float)$badge['xp_multiplier'];
        }
    } catch (Exception $e) { /* badges table may not exist yet */ }

    $user['current_badge']      = $current_badge;
    $user['current_multiplier'] = $current_multiplier;

    // ── VIP active check ─────────────────────────────────────────
    $vip_active     = false;
    $vip_expires_at = null;
    try {
        $vs = $db->prepare("
            SELECT expires_at FROM user_vip
            WHERE user_id = ? AND active = 1 AND expires_at > NOW()
            LIMIT 1
        ");
        $vs->execute([$user['id']]);
        $vrow = $vs->fetch(PDO::FETCH_ASSOC);
        if ($vrow) {
            $vip_active     = true;
            $vip_expires_at = $vrow['expires_at'];
        }
    } catch (Exception $e) { /* user_vip table may not exist */ }

    $user['vip_active']     = $vip_active ? 1 : 0;
    $user['vip_expires_at'] = $vip_expires_at;

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user'    => $user,
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}
?>
