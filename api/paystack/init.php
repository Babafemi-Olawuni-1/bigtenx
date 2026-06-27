<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/paystack.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? null;
$amount = $data["amount"] ?? null;

if (!$email || !$amount) {
    echo json_encode([
        "success" => false,
        "message" => "Email and amount required"
    ]);
    exit;
}

try {
    // Convert USD to NGN
    $usdRate = 1373.11;
    $nairaAmount = (float)$amount * $usdRate;

    $payload = [
        "email" => $email,
        "amount" => (int) round($nairaAmount * 100),
        "currency" => "NGN",
       "callback_url" => "https://bigtenx.com/dashboard?tab=wallet"
    ];

    // Check if cURL exists
    if (!function_exists("curl_init")) {
        echo json_encode([
            "success" => false,
            "message" => "cURL is not enabled on server"
        ]);
        exit;
    }

    $ch = curl_init("https://api.paystack.co/transaction/initialize");

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }

    curl_close($ch);

    echo $response;

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>