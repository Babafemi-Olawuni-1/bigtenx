<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input      = json_decode(file_get_contents('php://input'), true);
$userId     = (int)($input['user_id'] ?? 0);
$refCode    = trim($input['referral_code'] ?? '');

if (!$userId || !$refCode) { echo json_encode(['success'=>false,'message'=>'user_id and referral_code required']); exit; }

$db = getDB();

// Check user already has a referrer
$check = $db->prepare("SELECT referred_by FROM users WHERE id = ?");
$check->execute([$userId]);
$row = $check->fetch(PDO::FETCH_ASSOC);
if (!$row) { echo json_encode(['success'=>false,'message'=>'User not found']); exit; }
if (!empty($row['referred_by'])) { echo json_encode(['success'=>false,'message'=>'You already have a referrer']); exit; }

// Find referrer by code
$ref = $db->prepare("SELECT id, username FROM users WHERE referral_code = ? AND id != ? LIMIT 1");
$ref->execute([$refCode, $userId]);
$referrer = $ref->fetch(PDO::FETCH_ASSOC);
if (!$referrer) { echo json_encode(['success'=>false,'message'=>'Referral code not found']); exit; }

// Set the referrer
$db->prepare("UPDATE users SET referred_by = ? WHERE id = ?")->execute([$referrer['id'], $userId]);

echo json_encode(['success'=>true,'message'=>"Referrer set to {$referrer['username']} successfully",'referrer_username'=>$referrer['username']]);
?>
