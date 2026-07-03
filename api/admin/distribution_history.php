<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db = getDB();

// Ensure table
try {
    $db->exec("CREATE TABLE IF NOT EXISTS distribution_log (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        cycle       VARCHAR(7) NOT NULL,
        pool_amount DECIMAL(12,4) NOT NULL DEFAULT 0,
        users_paid  INT NOT NULL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(cycle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

try {
    $stmt = $db->query("SELECT * FROM distribution_log ORDER BY created_at DESC LIMIT 50");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'distributions' => $rows]);
} catch (Exception $e) {
    echo json_encode(['success' => true, 'distributions' => []]);
}
?>
