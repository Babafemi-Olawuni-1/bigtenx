<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/paystack.php";
require_once __DIR__ . "/../config/cors.php";

$accountNumber = $_GET['account_number'] ?? '';
$bankCode      = $_GET['bank_code']      ?? '';

if (!$accountNumber || !$bankCode) {
    echo json_encode(['success' => false, 'message' => 'account_number and bank_code required']);
    exit;
}

try {
    $url = "https://api.paystack.co/bank/resolve?account_number=" . urlencode($accountNumber) . "&bank_code=" . urlencode($bankCode);
    $ch  = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . PAYSTACK_SECRET_KEY]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    if (curl_errno($ch)) throw new Exception(curl_error($ch));
    curl_close($ch);
    echo $response;
} catch (Exception $e) {
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
?>
