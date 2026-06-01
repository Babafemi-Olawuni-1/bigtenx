<?php
require_once __DIR__ . '/../config/db.php';

$db = getDB();
$stmt = $db->query("SELECT COUNT(*) FROM admin_tasks");
$count = $stmt->fetchColumn();

echo "Total tasks in database: " . $count;