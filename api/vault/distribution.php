<?php
// Auto-payout: run on the 28th of each month
// Can also be triggered manually by admin
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db = getDB();

function getSetting($db, $key, $default) {
    try { $s=$db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1"); $s->execute([$key]); $v=$s->fetchColumn(); return $v!==false?$v:$default; }
    catch(Exception $e){return $default;}
}
function saveSetting($db,$key,$value){
    try{$db->prepare("INSERT INTO admin_settings(`key`,`value`) VALUES(?,?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$key,$value,$value]);}catch(Exception $e){}
}

// Validate: must be 28th (or admin forced)
$forceRun = isset($_GET['force']) && $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
$today    = (int)date('j');
if ($today !== 28 && !$forceRun) {
    echo json_encode(['success'=>false,'message'=>'Distribution only runs on the 28th']);
    exit;
}

$cycle        = date('Y-m');
$distPool     = (float)getSetting($db, 'month_revenue', 0);

if ($distPool <= 0) {
    echo json_encode(['success'=>false,'message'=>'Distribution pool is 0']);
    exit;
}

// Total contributions this cycle
$totalContrib = 0;
try {
    $s = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_contributions WHERE cycle=?");
    $s->execute([$cycle]);
    $totalContrib = (float)$s->fetchColumn();
} catch (Exception $e) {}

if ($totalContrib <= 0) {
    echo json_encode(['success'=>false,'message'=>'No contributions this cycle']);
    exit;
}

// Get all contributors this cycle
$contributors = [];
try {
    $s = $db->prepare("SELECT user_id, SUM(amount) AS total FROM vault_contributions WHERE cycle=? GROUP BY user_id");
    $s->execute([$cycle]);
    $contributors = $s->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}

$db->beginTransaction();
$paid = 0;
try {
    foreach ($contributors as $c) {
        $uid     = (int)$c['user_id'];
        $contrib = (float)$c['total'];
        $share   = round(($contrib / $totalContrib) * $distPool, 4);

        // Credit wallet
        $db->prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id=?")->execute([$share, $uid]);

        // Burn XP contribution
        $db->prepare("UPDATE users SET coins = GREATEST(0, coins - ?) WHERE id=?")->execute([(int)$contrib, $uid]);

        // Log to wallet_transactions
        $ref   = 'VAULT-DIST-'.strtoupper(substr(md5(uniqid()),0,8));
        $notes = json_encode(['reason'=>"Vault distribution {$cycle}",'contributed_xp'=>(int)$contrib]);
        try {
            $db->prepare("INSERT INTO wallet_transactions(user_id,type,amount,status,reference,notes,created_at) VALUES(?,'vault_distribution',?,'completed',?,?,NOW())")->execute([$uid,$share,$ref,$notes]);
        } catch (Exception $e) {}

        // Mark as paid in vault_contributions
        try {
            $db->prepare("UPDATE vault_contributions SET status='paid' WHERE user_id=? AND cycle=?")->execute([$uid,$cycle]);
        } catch (Exception $e) {}

        $paid++;
    }

    // Reset distribution pool
    saveSetting($db, 'month_revenue', 0);

    $db->commit();
    echo json_encode(['success'=>true,'message'=>"Distributed \${$distPool} to {$paid} users for cycle {$cycle}",'users_paid'=>$paid,'amount_distributed'=>$distPool]);

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>
