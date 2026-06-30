<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }

$input   = json_decode(file_get_contents('php://input'), true);
$userId  = (int)($input['user_id']       ?? 0);
$refCode = trim($input['referral_code']  ?? '');

if (!$userId || !$refCode) { echo json_encode(['success'=>false,'message'=>'user_id and referral_code required']); exit; }

$db = getDB();

// Check user
$check = $db->prepare("SELECT id, referred_by, referral_code FROM users WHERE id = ?");
$check->execute([$userId]);
$me = $check->fetch(PDO::FETCH_ASSOC);
if (!$me) { echo json_encode(['success'=>false,'message'=>'User not found']); exit; }

// Sponsor persists permanently — cannot change once set
if (!empty($me['referred_by'])) { echo json_encode(['success'=>false,'message'=>'You already have a referrer and it cannot be changed']); exit; }

// Find referrer
$ref = $db->prepare("SELECT id, username, referred_by FROM users WHERE referral_code = ? LIMIT 1");
$ref->execute([$refCode]);
$referrer = $ref->fetch(PDO::FETCH_ASSOC);
if (!$referrer) { echo json_encode(['success'=>false,'message'=>'Referral code not found']); exit; }

// Block self-referral
if ((int)$referrer['id'] === $userId) { echo json_encode(['success'=>false,'message'=>'You cannot refer yourself']); exit; }

// Block circular: referrer is referred BY the user (A→B, B tries to set A as sponsor)
if ((int)$referrer['referred_by'] === $userId) { echo json_encode(['success'=>false,'message'=>'Circular referral detected — this person is in your downline']); exit; }

// Block downline abuse: walk the referrer's upline chain — if userId appears anywhere, reject
function isInUpline($db, $startId, $targetId, $depth = 0) {
    if ($depth > 20) return false; // safety limit
    $s = $db->prepare("SELECT referred_by FROM users WHERE id = ?");
    $s->execute([$startId]);
    $row = $s->fetch(PDO::FETCH_ASSOC);
    if (!$row || empty($row['referred_by'])) return false;
    if ((int)$row['referred_by'] === $targetId) return true;
    return isInUpline($db, (int)$row['referred_by'], $targetId, $depth + 1);
}

if (isInUpline($db, (int)$referrer['id'], $userId)) {
    echo json_encode(['success'=>false,'message'=>'This person is in your downline — circular referral not allowed']); exit;
}

// Set referrer permanently
$db->prepare("UPDATE users SET referred_by = ? WHERE id = ?")->execute([$referrer['id'], $userId]);

echo json_encode(['success'=>true,'message'=>"Referrer set to {$referrer['username']} successfully",'referrer_username'=>$referrer['username']]);
?>
