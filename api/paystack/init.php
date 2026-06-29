<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/paystack.php";

$data   = json_decode(file_get_contents("php://input"), true);
$email  = $data["email"]  ?? null;
$amount = $data["amount"] ?? null; // USD amount

if (!$email || !$amount) { echo json_encode(["success" => false, "message" => "Email and amount required"]); exit; }

try {
    // ── Fetch live NGN rate ────────────────────────────────────────
    $liveRate    = 1550.0; // fallback
    $rateChannel = @file_get_contents("https://open.er-api.com/v6/latest/USD");
    if ($rateChannel) {
        $rateData = json_decode($rateChannel, true);
        if (!empty($rateData['rates']['NGN'])) {
            $liveRate = (float)$rateData['rates']['NGN'];
        }
    }

    // Convert USD → NGN kobo (Paystack charges in lowest denomination)
    $nairaAmount = (float)$amount * $liveRate;

    $payload = [
        "email"        => $email,
        "amount"       => (int) round($nairaAmount * 100), // kobo
        "currency"     => "NGN",
        "callback_url" => "https://bigtenx.com/dashboard?tab=wallet",
        "metadata"     => ["usd_amount" => (float)$amount, "rate_used" => $liveRate],
    ];

    if (!function_exists("curl_init")) { echo json_encode(["success" => false, "message" => "cURL not enabled"]); exit; }

    $ch = curl_init("https://api.paystack.co/transaction/initialize");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . PAYSTACK_SECRET_KEY, "Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    if (curl_errno($ch)) throw new Exception(curl_error($ch));
    curl_close($ch);

    // Append live rate to response so frontend can display it
    $decoded = json_decode($response, true);
    if (is_array($decoded)) {
        $decoded['live_rate'] = $liveRate;
        echo json_encode($decoded);
    } else {
        echo $response;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
