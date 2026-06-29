<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id        = $data['user_id']        ?? null;
$amount         = $data['amount']         ?? null;
$currency       = $data['currency']       ?? 'NGN';
$bank_name      = $data['bank_name']      ?? null;
$account_name   = $data['account_name']   ?? null;
$account_number = $data['account_number'] ?? null;
$wallet_address = $data['wallet_address'] ?? null;
$network        = $data['network']        ?? null;

if (!$user_id || !$amount) {
    echo json_encode(["success" => false, "message" => "user_id and amount are required"]);
    exit;
}

// Validate by currency type
if ($currency === 'USDT') {
    if (!$wallet_address) {
        echo json_encode(["success" => false, "message" => "Wallet address is required for USDT"]);
        exit;
    }
} else {
    if (!$bank_name || !$account_name || !$account_number) {
        echo json_encode(["success" => false, "message" => "Bank name, account name, and account number are required"]);
        exit;
    }
}

if ((float)$amount < 3) {
    echo json_encode(["success" => false, "message" => "Minimum withdrawal is \$3"]);
    exit;
}

try {
    $db = getDB();

    // Add notes column if it doesn't exist (safe migration for wallet_address storage)
    try { $db->exec("ALTER TABLE wallet_transactions ADD COLUMN notes TEXT NULL"); } catch (Exception $e) {}

    $stmt = $db->prepare("SELECT usd_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    if ((float)$amount > (float)$user['usd_balance']) {
        echo json_encode(["success" => false, "message" => "Insufficient balance"]);
        exit;
    }

    $reference = "WDR-" . time() . rand(100, 999);

    // Build notes field for USDT
    $notes = null;
    if ($currency === 'USDT') {
        $notes = json_encode(['network' => $network, 'wallet_address' => $wallet_address, 'currency' => $currency]);
    } else {
        $notes = json_encode(['currency' => $currency]);
    }

    $insert = $db->prepare("
        INSERT INTO wallet_transactions
            (user_id, type, amount, bank_name, account_name, account_number, status, reference, notes)
        VALUES (?, 'withdrawal', ?, ?, ?, ?, 'pending', ?, ?)
    ");

    $insert->execute([
        $user_id,
        (float)$amount,
        $bank_name ?: ($currency === 'USDT' ? 'USDT ' . ($network ?: 'TRC20') : null),
        $account_name ?: ($wallet_address ? substr($wallet_address, 0, 20) . '...' : null),
        $account_number ?: $wallet_address,
        $reference,
        $notes,
    ]);

    echo json_encode([
        "success"   => true,
        "message"   => "Withdrawal request submitted successfully. Pending admin approval.",
        "reference" => $reference,
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
