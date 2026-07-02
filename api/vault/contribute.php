<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input  = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);
$amount = (int)($input['amount']  ?? 0);

if (!$userId || $amount < 250) { echo json_encode(['success'=>false,'message'=>'Minimum contribution is 250 XP']); exit; }

$db = getDB();

// Ensure table exists
try {
    $db->exec("CREATE TABLE IF NOT EXISTS vault_contributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        cycle VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(user_id), INDEX(cycle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

// Check user has enough XP
$stmt = $db->prepare("SELECT coins FROM users WHERE id=?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { echo json_encode(['success'=>false,'message'=>'User not found']); exit; }
if ((int)$user['coins'] < $amount) { echo json_encode(['success'=>false,'message'=>'Insufficient XP']); exit; }

$cycle = date('Y-m');

$db->beginTransaction();
try {
    // Deduct XP
    $db->prepare("UPDATE users SET coins = coins - ? WHERE id=?")->execute([$amount, $userId]);

    // Log contribution
    $db->prepare("INSERT INTO vault_contributions (user_id, amount, cycle) VALUES (?,?,?)")->execute([$userId, $amount, $cycle]);

    $db->commit();
    echo json_encode(['success'=>true,'message'=>"Contributed {$amount} XP",'new_coins'=>(int)$user['coins'] - $amount]);
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>
