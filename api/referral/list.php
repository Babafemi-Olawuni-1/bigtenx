<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$userId = (int)($_GET['user_id'] ?? 0);
if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'user_id required']);
    exit;
}

$db = getDB();

try {
    $hasCommissions = true;
    try { $db->query("SELECT 1 FROM referral_commissions LIMIT 1"); }
    catch (Exception $e) { $hasCommissions = false; }

    if ($hasCommissions) {
        $stmt = $db->prepare("
            SELECT
                u.id, u.username, u.level, u.is_vip, u.created_at,
                COALESCE(SUM(rc.amount), 0) AS earned_from_user
            FROM users u
            LEFT JOIN referral_commissions rc ON rc.referrer_id = ? AND rc.referred_user_id = u.id
            WHERE u.referred_by = ?
            GROUP BY u.id, u.username, u.level, u.is_vip, u.created_at
            ORDER BY u.created_at DESC
        ");
        $stmt->execute([$userId, $userId]);
    } else {
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.level, u.is_vip, u.created_at, 0 AS earned_from_user
            FROM users u
            WHERE u.referred_by = ?
            ORDER BY u.created_at DESC
        ");
        $stmt->execute([$userId]);
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // "active" = level > 1 OR is_vip (since level_paid column doesn't exist)
    $referrals = array_map(function ($row) {
        $isActive  = ((int)$row['level'] > 1 || (int)$row['is_vip'] === 1);
        $planIndex = (int)$row['is_vip'] ? 4 : max(-1, (int)$row['level'] - 1);
        $initials  = strtoupper(substr($row['username'], 0, 2));
        return [
            'id'         => (int)$row['id'],
            'username'   => $row['username'],
            'initials'   => $initials,
            'level'      => (int)$row['level'],
            'is_vip'     => (int)$row['is_vip'],
            'plan_index' => $planIndex,
            'earned'     => round((float)$row['earned_from_user'], 2),
            'status'     => $isActive ? 'Active' : 'Pending',
            'joined'     => $row['created_at'],
        ];
    }, $rows);

    echo json_encode(['success' => true, 'referrals' => $referrals]);

} catch (Exception $e) {
    echo json_encode(['success' => true, 'referrals' => [], 'error' => $e->getMessage()]);
}
