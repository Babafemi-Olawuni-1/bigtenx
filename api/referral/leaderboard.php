<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));

$db = getDB();

// Top referrers by total commission earned
$stmt = $db->prepare("
    SELECT
        u.id,
        u.username,
        u.total_referrals,
        COALESCE(SUM(rc.amount), 0) AS total_earned
    FROM users u
    LEFT JOIN referral_commissions rc ON rc.referrer_id = u.id
    GROUP BY u.id, u.username, u.total_referrals
    HAVING total_earned > 0 OR u.total_referrals > 0
    ORDER BY total_earned DESC, u.total_referrals DESC
    LIMIT ?
");
$stmt->execute([$limit]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$leaderboard = array_map(function ($row, $idx) {
    return [
        'pos'       => $idx + 1,
        'username'  => $row['username'],
        'referrals' => (int)$row['total_referrals'],
        'earned'    => round((float)$row['total_earned'], 2),
    ];
}, $rows, array_keys($rows));

echo json_encode(['success' => true, 'leaderboard' => $leaderboard]);
