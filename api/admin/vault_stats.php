<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure tables
foreach ([
    "CREATE TABLE IF NOT EXISTS vault_contributions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, amount INT NOT NULL, cycle VARCHAR(7) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS vault_units (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, quantity INT NOT NULL DEFAULT 0, UNIQUE KEY(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
] as $sql) { try { $db->exec($sql); } catch (Exception $e) {} }

function getSetting($db, $key, $default) {
    try {
        $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1");
        $s->execute([$key]);
        $v = $s->fetchColumn();
        return $v !== false ? $v : $default;
    } catch (Exception $e) { return $default; }
}

function saveSetting($db, $key, $value) {
    try {
        $db->prepare("INSERT INTO admin_settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$key,$value,$value]);
    } catch (Exception $e) {}
}

if ($method === 'GET') {
    $unitPrice  = (float)getSetting($db, 'vault_unit_price', 15);
    $basicLimit = (int)getSetting($db,   'vault_basic_limit', 2);
    $txFee      = (float)getSetting($db, 'vault_tx_fee', 2);
    $buyEnabled = (int)getSetting($db,   'vault_buy_enabled', 1);
    $sellEnabled= (int)getSetting($db,   'vault_sell_enabled', 1);

    $totalUnits = 0;
    try { $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn(); } catch (Exception $e) {}

    $holders = 0;
    try { $holders = (int)$db->query("SELECT COUNT(*) FROM vault_units WHERE quantity > 0")->fetchColumn(); } catch (Exception $e) {}

    $monthRevenue = (float)getSetting($db, 'month_revenue', 0);

    echo json_encode([
        'success'           => true,
        'unit_price'        => $unitPrice,
        'total_units'       => $totalUnits,
        'unit_holders'      => $holders,
        'month_revenue'     => $monthRevenue,
        'distribution_pool' => $monthRevenue,
        'settings' => [
            'basic_limit'  => $basicLimit,
            'tx_fee'       => $txFee,
            'buy_enabled'  => (bool)$buyEnabled,
            'sell_enabled' => (bool)$sellEnabled,
        ],
    ]);
    exit;
}

if ($method === 'POST') {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (strlen($token) < 10) { http_response_code(401); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

    $input  = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'add_funds') {
        $amount = (float)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? '');
        if ($amount <= 0 || !$reason) { echo json_encode(['success'=>false,'message'=>'Amount and reason required']); exit; }
        $current = (float)getSetting($db, 'month_revenue', 0);
        saveSetting($db, 'month_revenue', $current + $amount);
        try { $db->exec("CREATE TABLE IF NOT EXISTS vault_admin_log (id INT AUTO_INCREMENT PRIMARY KEY, action VARCHAR(20), amount DECIMAL(10,2), reason TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB");
              $db->prepare("INSERT INTO vault_admin_log (action,amount,reason) VALUES ('add',?,?)")->execute([$amount, $reason]);
        } catch (Exception $e) {}
        echo json_encode(['success'=>true,'message'=>'Funds added to vault']);
        exit;
    }

    if ($action === 'save_settings') {
        saveSetting($db, 'vault_basic_limit',  $input['basic_limit']  ?? 2);
        saveSetting($db, 'vault_tx_fee',       $input['tx_fee']       ?? 2);
        saveSetting($db, 'vault_unit_price',   $input['unit_price']   ?? 15);
        saveSetting($db, 'vault_buy_enabled',  $input['buy_enabled']  ?? 1);
        saveSetting($db, 'vault_sell_enabled', $input['sell_enabled'] ?? 1);
        echo json_encode(['success'=>true,'message'=>'Settings saved']);
        exit;
    }

    if ($action === 'deduct_funds') {
        $amount = (float)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? '');
        if ($amount <= 0 || !$reason) { echo json_encode(['success'=>false,'message'=>'Amount and reason required']); exit; }
        $current = (float)getSetting($db, 'month_revenue', 0);
        if ($amount > $current) { echo json_encode(['success'=>false,'message'=>'Cannot deduct more than current pool']); exit; }
        saveSetting($db, 'month_revenue', $current - $amount);
        try { $db->prepare("INSERT INTO vault_admin_log (action,amount,reason) VALUES ('deduct',?,?)")->execute([$amount,$reason]); } catch (Exception $e) {}
        echo json_encode(['success'=>true,'message'=>'Funds deducted from vault']);
        exit;
    }

    echo json_encode(['success'=>false,'message'=>'Unknown action']);
    exit;
}

echo json_encode(['success'=>false,'message'=>'Method not allowed']);
?>
