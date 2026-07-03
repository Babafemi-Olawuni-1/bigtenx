<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { 
    http_response_code(405); 
    echo json_encode(['success' => false, 'message' => 'POST required']); 
    exit; 
}

$input  = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);
$amount = (int)($input['amount']  ?? 0);

if (!$userId) { 
    echo json_encode(['success' => false, 'message' => 'user_id required']); 
    exit; 
}

$db = getDB();

// ── Helper function ──────────────────────────────────────────────────────
function getSetting($db, $key, $default) {
    try { 
        $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1"); 
        $s->execute([$key]); 
        $v = $s->fetchColumn(); 
        return $v !== false ? $v : $default; 
    } catch (Exception $e) { 
        return $default; 
    }
}

// ── Read minimum from admin_settings ────────────────────────────────────
$minContrib = (int)getSetting($db, 'xp_min_contribution', 250);

if ($amount < $minContrib) {
    echo json_encode(['success' => false, 'message' => "Minimum contribution is {$minContrib} XP"]);
    exit;
}

// ── Ensure table exists ──────────────────────────────────────────────────
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

// ── Check user XP ────────────────────────────────────────────────────────
$stmt = $db->prepare("SELECT coins FROM users WHERE id=?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { 
    echo json_encode(['success' => false, 'message' => 'User not found']); 
    exit; 
}
if ((int)$user['coins'] < $amount) { 
    echo json_encode(['success' => false, 'message' => 'Insufficient XP']); 
    exit; 
}

// ── Check window is open ─────────────────────────────────────────────────
$openDay  = (int)getSetting($db, 'xp_open_day', 1);
$closeDay = (int)getSetting($db, 'xp_close_day', 25);
$today    = (int)date('j');

if ($today < $openDay || $today > $closeDay) {
    echo json_encode(['success' => false, 'message' => 'Contribution window is closed']);
    exit;
}

$cycle = date('Y-m');

$db->beginTransaction();
try {
    // ── Deduct XP ──────────────────────────────────────────────────────
    $db->prepare("UPDATE users SET coins = coins - ? WHERE id=?")->execute([$amount, $userId]);
    
    // ── Log contribution ───────────────────────────────────────────────
    $db->prepare("INSERT INTO vault_contributions (user_id, amount, cycle) VALUES (?,?,?)")->execute([$userId, $amount, $cycle]);
    
    $db->commit();
    
    $newCoins = (int)$user['coins'] - $amount;
    
    // ── Get updated stats ──────────────────────────────────────────────
    $totalXP = (int)$db->query("SELECT COALESCE(SUM(coins),0) FROM users")->fetchColumn();
    $monthRevenue = (float)getSetting($db, 'month_revenue', 0);
    $unitPrice = (float)getSetting($db, 'vault_unit_price', 15);
    
    $totalUnits = 0;
    try { 
        $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn(); 
    } catch (Exception $e) {}
    
    // ── Get user's own contribution for this cycle ────────────────────
    $myContrib = 0;
    try {
        $s = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_contributions WHERE user_id=? AND cycle=?");
        $s->execute([$userId, $cycle]);
        $myContrib = (int)$s->fetchColumn();
    } catch (Exception $e) {}
    
    // ── Get user's units ──────────────────────────────────────────────
    $myUnits = 0;
    try {
        $s = $db->prepare("SELECT COALESCE(quantity,0) FROM vault_units WHERE user_id=?");
        $s->execute([$userId]);
        $myUnits = (int)($s->fetchColumn() ?: 0);
    } catch (Exception $e) {}
    
    // ── Response with updated data ────────────────────────────────────
    echo json_encode([
        'success' => true,
        'message' => "Contributed {$amount} XP",
        'new_coins' => $newCoins,
        'my_contribution' => $myContrib,
        'my_units' => $myUnits,
        'updated_pool' => [
            'total_xp' => $totalXP,
            'month_revenue' => $monthRevenue,
            'unit_price' => $unitPrice,
            'total_units' => $totalUnits,
            'settings' => [
                'open_day' => $openDay,
                'close_day' => $closeDay,
                'dist_day' => (int)getSetting($db, 'xp_dist_day', 28),
                'min_xp' => $minContrib,
            ]
        ]
    ]);
    
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>