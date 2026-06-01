<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure admin_settings table exists
$db->exec("
    CREATE TABLE IF NOT EXISTS admin_settings (
        `key`   VARCHAR(100) PRIMARY KEY,
        `value` TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
");

// GET — return current month revenue
if ($method === 'GET') {
    $stmt = $db->prepare("SELECT value FROM admin_settings WHERE `key` = 'month_revenue' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'success'       => true,
        'month_revenue' => $row ? (float)$row['value'] : 0,
    ]);
    exit;
}

// POST — set month revenue
if ($method === 'POST') {
    $input   = json_decode(file_get_contents('php://input'), true);
    $revenue = (float)($input['month_revenue'] ?? 0);

    $db->prepare("
        INSERT INTO admin_settings (`key`, `value`) VALUES ('month_revenue', ?)
        ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()
    ")->execute([$revenue]);

    echo json_encode(['success' => true, 'month_revenue' => $revenue]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
