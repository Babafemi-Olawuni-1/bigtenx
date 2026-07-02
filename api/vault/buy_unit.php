<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true);
$userId   = (int)($input['user_id']  ?? 0);
$quantity = (int)($input['quantity'] ?? 1);
if ($quantity < 1) $quantity = 1;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'user_id required']);
    exit;
}

$db = getDB();

// Ensure tables
try {
    $db->exec("CREATE TABLE IF NOT EXISTS vault_units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        UNIQUE KEY uk_user(user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

// Load settings
function getVaultSetting($db, $key, $default) {
    try {
        $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1");
        $s->execute([$key]);
        $v = $s->fetchColumn();
        return $v !== false ? $v : $default;
    } catch (Exception $e) { return $default; }
}

$unitPrice  = (float)getVaultSetting($db, 'vault_unit_price',  15);
$feePercent = (float)getVaultSetting($db, 'vault_tx_fee',       2) / 100;
$basicLimit = (int)getVaultSetting($db,   'vault_basic_limit',  2);

// How many units does the user currently own?
$currentUnits = 0;
try {
    $s = $db->prepare("SELECT COALESCE(quantity,0) FROM vault_units WHERE user_id=?");
    $s->execute([$userId]);
    $currentUnits = (int)($s->fetchColumn() ?: 0);
} catch (Exception $e) {}

// Check if user has all 4 badges + VIP for unlimited access
$hasUnlimited = false;
try {
    $requiredBadges = ['Bronze','Silver','Gold','Diamond'];
    $s = $db->prepare("
        SELECT COUNT(DISTINCT b.name) FROM user_badges ub
        JOIN badges b ON b.id = ub.badge_id
        WHERE ub.user_id = ? AND b.name IN ('Bronze','Silver','Gold','Diamond')
    ");
    $s->execute([$userId]);
    $badgeCount = (int)$s->fetchColumn();

    $vipActive = false;
    $vs = $db->prepare("SELECT id FROM user_vip WHERE user_id=? AND active=1 AND expires_at > NOW() LIMIT 1");
    $vs->execute([$userId]);
    $vipActive = (bool)$vs->fetch();

    $hasUnlimited = ($badgeCount >= 4 && $vipActive);
} catch (Exception $e) {}

// Check if user has at least one badge for basic access
$hasBadge = false;
try {
    $s = $db->prepare("SELECT COUNT(*) FROM user_badges WHERE user_id=?");
    $s->execute([$userId]);
    $hasBadge = (int)$s->fetchColumn() > 0;
} catch (Exception $e) {}

if (!$hasBadge && !$hasUnlimited) {
    echo json_encode(['success' => false, 'message' => 'You need at least one badge to buy vault units']);
    exit;
}

// Enforce max units limit
if (!$hasUnlimited) {
    $maxAllowed = $basicLimit; // e.g. 2
    if ($currentUnits >= $maxAllowed) {
        echo json_encode(['success' => false, 'message' => "Basic vault limit reached ({$maxAllowed} units max). Buy all 4 badges + VIP for unlimited."]);
        exit;
    }
    // Cap quantity so they can't exceed limit even in one purchase
    $canBuy = $maxAllowed - $currentUnits;
    if ($quantity > $canBuy) {
        echo json_encode(['success' => false, 'message' => "You can only buy {$canBuy} more unit(s) on basic vault"]);
        exit;
    }
}

// Cost = unit price × quantity × (1 + fee)
$baseCost   = round($unitPrice * $quantity, 4);
$feeAmount  = round($baseCost * $feePercent, 4);
$totalCost  = round($baseCost + $feeAmount, 2);

// Check user balance
$stmt = $db->prepare("SELECT usd_balance FROM users WHERE id=?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { echo json_encode(['success' => false, 'message' => 'User not found']); exit; }
if ((float)$user['usd_balance'] < $totalCost) {
    echo json_encode(['success' => false, 'message' => "Insufficient balance. Need \${$totalCost}, have \${$user['usd_balance']}"]);
    exit;
}

$db->beginTransaction();
try {
    // Deduct full cost from user
    $db->prepare("UPDATE users SET usd_balance = usd_balance - ? WHERE id=?")->execute([$totalCost, $userId]);

    // Credit vault pool with fee amount (adds to month_revenue / distribution pool)
    try {
        $db->prepare("INSERT INTO admin_settings (`key`,`value`) VALUES ('month_revenue',?) ON DUPLICATE KEY UPDATE `value` = `value` + ?")
           ->execute([$feeAmount, $feeAmount]);
    } catch (Exception $e) {}

    // Add units
    $db->prepare("INSERT INTO vault_units (user_id, quantity) VALUES (?,?) ON DUPLICATE KEY UPDATE quantity = quantity + ?")
       ->execute([$userId, $quantity, $quantity]);

    // Log wallet transaction
    $ref   = 'VAULT-BUY-' . strtoupper(substr(md5(uniqid()), 0, 8));
    $notes = json_encode([
        'reason'    => "Bought {$quantity} vault unit(s)",
        'unit_price'=> $unitPrice,
        'fee'       => $feeAmount,
        'base_cost' => $baseCost,
    ]);
    try {
        $db->prepare("INSERT INTO wallet_transactions (user_id,type,amount,status,reference,notes,created_at) VALUES (?,'vault_buy',?,'completed',?,?,NOW())")
           ->execute([$userId, $totalCost, $ref, $notes]);
    } catch (Exception $e) {}

    $db->commit();

    $newBalance = round((float)$user['usd_balance'] - $totalCost, 2);
    echo json_encode([
        'success'     => true,
        'message'     => "Bought {$quantity} unit" . ($quantity > 1 ? 's' : ''),
        'new_balance' => $newBalance,
        'fee_paid'    => $feeAmount,
        'total_cost'  => $totalCost,
    ]);

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
