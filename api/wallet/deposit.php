<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$user_id = $_POST['user_id'] ?? null;
$amount = $_POST['amount'] ?? null;

if (!$user_id || !$amount || !isset($_FILES['receipt'])) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

try {
    $uploadDir = "../uploads/receipts/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . "_" . basename($_FILES["receipt"]["name"]);
    $targetFile = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES["receipt"]["tmp_name"], $targetFile)) {
        echo json_encode([
            "success" => false,
            "message" => "Receipt upload failed"
        ]);
        exit;
    }

    $reference = "DEP-" . time() . rand(100, 999);

    $db = getDB();

    $stmt = $db->prepare("
        INSERT INTO wallet_transactions
        (user_id, type, amount, receipt, status, reference)
        VALUES (?, 'deposit', ?, ?, 'pending', ?)
    ");

    $stmt->execute([
        $user_id,
        $amount,
        $fileName,
        $reference
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Deposit submitted for approval",
        "reference" => $reference
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>