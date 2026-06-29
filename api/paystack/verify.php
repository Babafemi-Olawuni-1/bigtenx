<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/paystack.php";
require_once __DIR__ . "/../config/db.php";

$reference = $_GET["reference"] ?? null;
$user_id   = $_GET["user_id"]   ?? null;

if (!$reference || !$user_id) {
    echo json_encode(["success" => false, "message" => "Reference and user_id required"]);
    exit;
}

try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/verify/" . urlencode($reference));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . PAYSTACK_SECRET_KEY]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    if (curl_errno($ch)) throw new Exception(curl_error($ch));
    curl_close($ch);

    $result = json_decode($response, true);

    if ($result["status"] && $result["data"]["status"] === "success") {
        $nairaAmount = $result["data"]["amount"] / 100; // kobo → naira

        // Use the rate stored in metadata if available, otherwise use live rate
        $rateUsed = (float)($result["data"]["metadata"]["rate_used"] ?? 0);
        if (!$rateUsed) {
            // Fetch live rate as fallback
            $rc = @file_get_contents("https://open.er-api.com/v6/latest/USD");
            $rd = $rc ? json_decode($rc, true) : [];
            $rateUsed = !empty($rd['rates']['NGN']) ? (float)$rd['rates']['NGN'] : 1550.0;
        }
        $usdAmount = round($nairaAmount / $rateUsed, 4);

        $db = getDB();

        // Prevent double-crediting: check if reference already logged
        $dup = $db->prepare("SELECT id FROM wallet_transactions WHERE reference = ? AND status = 'completed' LIMIT 1");
        $dup->execute([$reference]);
        if ($dup->fetch()) {
            $bal = $db->prepare("SELECT usd_balance FROM users WHERE id = ?");
            $bal->execute([$user_id]);
            $row = $bal->fetch();
            echo json_encode(["success" => true, "message" => "Already verified", "newBalance" => (float)$row["usd_balance"]]);
            exit;
        }

        $stmt = $db->prepare("SELECT usd_balance FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        if (!$user) { echo json_encode(["success" => false, "message" => "User not found"]); exit; }

        $newBalance = round((float)$user["usd_balance"] + $usdAmount, 4);
        $db->prepare("UPDATE users SET usd_balance = ? WHERE id = ?")->execute([$newBalance, $user_id]);

        $db->prepare("
            INSERT INTO wallet_transactions (user_id, type, amount, status, reference)
            VALUES (?, 'deposit', ?, 'completed', ?)
        ")->execute([$user_id, $usdAmount, $reference]);

        echo json_encode(["success" => true, "message" => "Payment verified", "newBalance" => $newBalance]);
    } else {
        echo json_encode(["success" => false, "message" => "Payment verification failed"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
