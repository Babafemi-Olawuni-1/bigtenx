<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'GET method required'
    ]);
    exit;
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

$db = getDB();

try {
    // Get all active badges
    $stmt = $db->query("
        SELECT *
        FROM badges
        WHERE active = 1
        ORDER BY price ASC
    ");

    $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If user is passed, mark owned badges
    if ($userId) {
        $stmt = $db->prepare("
            SELECT badge_id
            FROM user_badges
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);

        $owned = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($badges as &$badge) {
            $badge['owned'] = in_array($badge['id'], $owned);
        }
    }

    echo json_encode([
        'success' => true,
        'badges' => $badges
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed: ' . $e->getMessage()
    ]);
}
?>