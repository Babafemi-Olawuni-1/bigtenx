<?php
header("Content-Type: application/json");
require_once "../../config/paystack.php";
require_once "../config/db.php";

$reference = $_GET["reference"] ?? null;
$user_id = $_GET["user_id"] ?? null;

if (!$reference || !$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "Reference required"
    ]);
    exit;
}

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/verify/" . $reference);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . PAYSTACK_SECRET_KEY
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if ($result["status"] && $result["data"]["status"] === "success") {
   $nairaAmount = $result["data"]["amount"] / 100;
$usdRate = 1373.11;
$amount = $nairaAmount / $usdRate;

    $db = getDB();

    $stmt = $db->prepare("SELECT usd_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    $newBalance = (float)$user["usd_balance"] + (float)$amount;

    $update = $db->prepare("
        UPDATE users SET usd_balance = ? WHERE id = ?
    ");
    $update->execute([$newBalance, $user_id]);

    $insert = $db->prepare("
        INSERT INTO wallet_transactions
        (user_id, type, amount, status, reference)
        VALUES (?, 'deposit', ?, 'completed', ?)
    ");
    $insert->execute([$user_id, $amount, $reference]);

    echo json_encode([
        "success" => true,
        "message" => "Payment verified",
        "newBalance" => $newBalance
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Verification failed"
    ]);
}
?>