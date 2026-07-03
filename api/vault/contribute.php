<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input  = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);
$amount = (int)($input['amount']  ?? 0);

if (!$userId) { echo json_encode(['success'=>false,'message'=>'user_id required']); exit; }

$db = getDB();

// Read minimum from admin_settings (honours admin config — fixes Part 4 Bug 1)
$minContrib = 250;
try {
    $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`='xp_min_contribution' LIMIT 1");
    $s->execute(); $v = $s->fetchColumn();
    if ($v !== false) $minContrib = (int)$v;
} catch (Exception $e) {}

if ($amount < $minContrib) {
    echo json_encode(['success'=>false,'message'=>"Minimum contribution is {$minContrib} XP"]);
    exit;
}

// Ensure table
try {
    $db->exec("CREATE TABLE IF NOT EXISTS vault_contributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        cycle VARCHAR(7) NOT NULL,
        status ENUM('pending','paid') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(user_id), INDEX(cycle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

// Check user XP
$stmt = $db->prepare("SELECT coins FROM users WHERE id=?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { echo json_encode(['success'=>false,'message'=>'User not found']); exit; }
if ((int)$user['coins'] < $amount) { echo json_encode(['success'=>false,'message'=>'Insufficient XP']); exit; }

// Check window is open (1st–close_day)
$openDay  = (int)getSetting($db, 'xp_open_day', 1);
$closeDay = (int)getSetting($db, 'xp_close_day', 25);
$today    = (int)date('j');
if ($today < $openDay || $today > $closeDay) {
    echo json_encode(['success'=>false,'message'=>'Contribution window is closed']);
    exit;
}

function getSetting($db, $key, $default) {
    try { $s=$db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1"); $s->execute([$key]); $v=$s->fetchColumn(); return $v!==false?$v:$default; }
    catch(Exception $e){return $default;}
}

$cycle = date('Y-m');

$db->beginTransaction();
try {
    // Deduct XP
    $db->prepare("UPDATE users SET coins = coins - ? WHERE id=?")->execute([$amount, $userId]);
    // Log contribution
    $db->prepare("INSERT INTO vault_contributions (user_id, amount, cycle) VALUES (?,?,?)")->execute([$userId, $amount, $cycle]);
    $db->commit();
    $newCoins = (int)$user['coins'] - $amount;
    echo json_encode(['success'=>true,'message'=>"Contributed {$amount} XP",'new_coins'=>$newCoins]);
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>
