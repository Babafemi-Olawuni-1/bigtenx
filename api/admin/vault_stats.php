<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

// ── Get admin token from header ─────────────────────────────────────────
$headers = getallheaders();
$adminToken = null;

// Check X-Admin-Token header
if (isset($headers['X-Admin-Token'])) {
    $adminToken = $headers['X-Admin-Token'];
}
// Fallback: check Authorization header
elseif (isset($headers['Authorization'])) {
    $auth = $headers['Authorization'];
    if (strpos($auth, 'Bearer ') === 0) {
        $adminToken = substr($auth, 7);
    }
}
// Fallback: check query parameter
elseif (isset($_GET['token'])) {
    $adminToken = $_GET['token'];
}

// ── Validate admin token ──────────────────────────────────────────────
$validToken = false;

if ($adminToken) {
    try {
        // Check if admin_settings table exists
        $tableCheck = $db->query("SHOW TABLES LIKE 'admin_settings'");
        if ($tableCheck->rowCount() > 0) {
            $stmt = $db->prepare("SELECT `value` FROM admin_settings WHERE `key` = 'admin_api_token' LIMIT 1");
            $stmt->execute();
            $storedToken = $stmt->fetchColumn();
            if ($storedToken && $adminToken === $storedToken) {
                $validToken = true;
            }
        }
    } catch (Exception $e) {
        // Table might not exist, skip
    }

    // Fallback hardcoded tokens (for testing)
    if (!$validToken) {
        $validTokens = [
            'your-admin-token-here',
            'test-token',
            'admin123',
            'bigtenx-admin-2024'
        ];
        if (in_array($adminToken, $validTokens)) {
            $validToken = true;
        }
    }
}

if (!$validToken) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid admin token']);
    exit;
}

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

function saveSetting($db, $key, $value) {
    try { 
        $db->prepare("INSERT INTO admin_settings (`key`,`value`) VALUES(?,?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$key, $value, $value]); 
    } catch (Exception $e) {}
}

// ── Handle POST requests ─────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    // ── Add/Deduct Funds ──────────────────────────────────────────────
    if ($action === 'add_funds' || $action === 'deduct_funds') {
        $amount = (float)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? '');

        if ($amount <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid amount']);
            exit;
        }

        if (empty($reason)) {
            echo json_encode(['success' => false, 'message' => 'Reason is required']);
            exit;
        }

        try {
            $currentPool = (float)getSetting($db, 'month_revenue', 0);
            
            if ($action === 'add_funds') {
                $newPool = $currentPool + $amount;
                saveSetting($db, 'month_revenue', $newPool);
                
                echo json_encode([
                    'success' => true,
                    'message' => "Added $" . number_format($amount, 2) . " to vault pool",
                    'new_balance' => $newPool
                ]);
            } else {
                if ($currentPool < $amount) {
                    echo json_encode(['success' => false, 'message' => 'Insufficient pool balance']);
                    exit;
                }
                $newPool = $currentPool - $amount;
                saveSetting($db, 'month_revenue', $newPool);
                
                echo json_encode([
                    'success' => true,
                    'message' => "Deducted $" . number_format($amount, 2) . " from vault pool",
                    'new_balance' => $newPool
                ]);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    // ── Save Settings ──────────────────────────────────────────────────
    if ($action === 'save_settings') {
        try {
            $basicLimit = (int)($input['basic_limit'] ?? 2);
            $txFee = (float)($input['tx_fee'] ?? 2);
            $unitPrice = (float)($input['unit_price'] ?? 15);
            $buyEnabled = (int)($input['buy_enabled'] ?? 1);
            $sellEnabled = (int)($input['sell_enabled'] ?? 1);

            saveSetting($db, 'vault_basic_limit', $basicLimit);
            saveSetting($db, 'vault_tx_fee', $txFee);
            saveSetting($db, 'vault_unit_price', $unitPrice);
            saveSetting($db, 'vault_buy_enabled', $buyEnabled);
            saveSetting($db, 'vault_sell_enabled', $sellEnabled);

            echo json_encode(['success' => true, 'message' => 'Settings saved']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

// ── GET request - return stats ──────────────────────────────────────────
$unitPrice = (float)getSetting($db, 'vault_unit_price', 15);
$totalUnits = 0;
try { 
    $totalUnits = (int)$db->query("SELECT COALESCE(SUM(quantity),0) FROM vault_units")->fetchColumn(); 
} catch (Exception $e) {}

$unitHolders = 0;
try { 
    $unitHolders = (int)$db->query("SELECT COUNT(DISTINCT user_id) FROM vault_units WHERE quantity > 0")->fetchColumn(); 
} catch (Exception $e) {}

$distributionPool = (float)getSetting($db, 'month_revenue', 0);
if ($distributionPool > 999999999999 || $distributionPool < 0) {
    $distributionPool = 0;
    saveSetting($db, 'month_revenue', 0);
}

$totalValue = $totalUnits * $unitPrice;

// ── Get window status ──────────────────────────────────────────────────
$today = (int)date('j');
$openDay = (int)getSetting($db, 'xp_open_day', 1);
$closeDay = (int)getSetting($db, 'xp_close_day', 25);
$isOpen = ($today >= $openDay && $today <= $closeDay);

// ── Get buy/sell enabled status ────────────────────────────────────────
$buyEnabled = (int)getSetting($db, 'vault_buy_enabled', 1);
$sellEnabled = (int)getSetting($db, 'vault_sell_enabled', 1);

// ── Get basic limit ────────────────────────────────────────────────────
$basicLimit = (int)getSetting($db, 'vault_basic_limit', 2);
$txFee = (float)getSetting($db, 'vault_tx_fee', 2);

echo json_encode([
    'success' => true,
    'unit_price' => $unitPrice,
    'total_units' => $totalUnits,
    'unit_holders' => $unitHolders,
    'distribution_pool' => $distributionPool,
    'window_status' => $isOpen ? 'Open' : 'Closed',
    'total_value' => $totalValue,
    'settings' => [
        'basic_limit' => $basicLimit,
        'tx_fee' => $txFee,
        'buy_enabled' => (bool)$buyEnabled,
        'sell_enabled' => (bool)$sellEnabled,
        'open_day' => $openDay,
        'close_day' => $closeDay,
    ]
]);
?>