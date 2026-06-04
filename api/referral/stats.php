<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$userId = (int)($_GET['user_id'] ?? 0);
if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'user_id required']);
    exit;
}

$db = getDB();

// Helper: safely run a count query
function safeCount($db, $sql, $params = []) {
    try {
        $s = $db->prepare($sql);
        $s->execute($params);
        return (int)$s->fetchColumn();
    } catch (Exception $e) {
        return 0;
    }
}

$totalInvites = safeCount($db,
    "SELECT COUNT(*) FROM users WHERE referred_by = ?", [$userId]);

$activeInvites = safeCount($db,
    "SELECT COUNT(DISTINCT u.id)
     FROM users u
     WHERE u.referred_by = ?
       AND u.level_paid = 1",
    [$userId]);

// Fall back gracefully if task_completions or referral_commissions don't exist
$activeWithTask = 0;
try {
    $s = $db->prepare("
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        WHERE u.referred_by = ?
          AND EXISTS (SELECT 1 FROM task_completions tc WHERE tc.user_id = u.id)
    ");
    $s->execute([$userId]);
    $activeWithTask = (int)$s->fetchColumn();
} catch (Exception $e) { /* table missing */ }

$activeInvites = max($activeInvites, $activeWithTask);

$activeVip = safeCount($db,
    "SELECT COUNT(*) FROM users WHERE referred_by = ? AND is_vip = 1", [$userId]);

$totalEarned = 0;
try {
    $s = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM referral_commissions WHERE referrer_id = ?");
    $s->execute([$userId]);
    $totalEarned = round((float)$s->fetchColumn(), 2);
} catch (Exception $e) { /* table missing */ }

echo json_encode([
    'success'        => true,
    'total_invites'  => $totalInvites,
    'active_invites' => $activeInvites,
    'active_vip'     => $activeVip,
    'total_earned'   => $totalEarned,
]);
