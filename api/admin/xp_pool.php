<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function getSetting($db, $key, $default) {
    try { $s=$db->prepare("SELECT `value` FROM admin_settings WHERE `key`=? LIMIT 1"); $s->execute([$key]); $v=$s->fetchColumn(); return $v!==false?$v:$default; }
    catch(Exception $e){return $default;}
}
function saveSetting($db,$key,$value){
    try{$db->prepare("INSERT INTO admin_settings(`key`,`value`) VALUES(?,?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$key,$value,$value]);}catch(Exception $e){}
}

// Ensure vault_contributions table
try{$db->exec("CREATE TABLE IF NOT EXISTS vault_contributions(id INT AUTO_INCREMENT PRIMARY KEY,user_id INT NOT NULL,amount INT NOT NULL,cycle VARCHAR(7) NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,INDEX(user_id),INDEX(cycle))ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");}catch(Exception $e){}

$ADMIN_PASSWORD = 'BigTenX@Admin2025'; // same as admin login

if($method==='GET'){
    // Check if admin token supplied
    $token=$_SERVER['HTTP_X_ADMIN_TOKEN']??'';
    if(strlen($token)<10){http_response_code(401);echo json_encode(['success'=>false,'message'=>'Unauthorized']);exit;}

    // Summary stats
    $cycle=date('Y-m');
    $totalContrib=0;
    try{$totalContrib=(int)$db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_contributions WHERE cycle=?")->execute([$cycle])?:0;
        $s=$db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_contributions WHERE cycle=?");$s->execute([$cycle]);$totalContrib=(int)$s->fetchColumn();}catch(Exception $e){}

    $distPool=(float)getSetting($db,'month_revenue',0);
    $minXp=(int)getSetting($db,'xp_min_contribution',250);
    $openDay=(int)getSetting($db,'xp_open_day',1);
    $closeDay=(int)getSetting($db,'xp_close_day',25);
    $distDay=(int)getSetting($db,'xp_dist_day',28);

    $today=(int)date('j');
    $windowOpen=($today>=$openDay&&$today<=$closeDay);

    // Eligible users = users who contributed this cycle
    $eligibleUsers=0;
    try{$s=$db->prepare("SELECT COUNT(DISTINCT user_id) FROM vault_contributions WHERE cycle=?");$s->execute([$cycle]);$eligibleUsers=(int)$s->fetchColumn();}catch(Exception $e){}

    // Time remaining
    $endDate=new DateTime(date('Y-m-').str_pad($closeDay,2,'0',STR_PAD_LEFT).' 23:59:59');
    $now=new DateTime();
    $diff=$now<$endDate?$endDate->diff($now):null;
    $timeRemaining=$diff?$diff->format('%ad %H:%I:%S'):'Closed';

    // Search
    $searchQ=trim($_GET['search']??'');
    if($searchQ){
        $stmt=$db->prepare("SELECT id,username,email,coins FROM users WHERE username=? OR email=? LIMIT 1");
        $stmt->execute([$searchQ,$searchQ]);
        $user=$stmt->fetch(PDO::FETCH_ASSOC);
        if(!$user){echo json_encode(['success'=>false,'message'=>'User not found']);exit;}
        $contrib=0;
        try{$s=$db->prepare("SELECT COALESCE(SUM(amount),0) FROM vault_contributions WHERE user_id=? AND cycle=?");$s->execute([$user['id'],$cycle]);$contrib=(int)$s->fetchColumn();}catch(Exception $e){}
        $user['contribution']=$contrib;
        echo json_encode(['success'=>true,'user'=>$user]);
        exit;
    }

    echo json_encode(['success'=>true,'total_contributions'=>$totalContrib,'distribution_pool'=>$distPool,'eligible_users'=>$eligibleUsers,'window_open'=>$windowOpen,'time_remaining'=>$timeRemaining,'settings'=>['min_xp'=>$minXp,'open_day'=>$openDay,'close_day'=>$closeDay,'dist_day'=>$distDay]]);
    exit;
}

if($method==='POST'){
    $token=$_SERVER['HTTP_X_ADMIN_TOKEN']??'';
    if(strlen($token)<10){http_response_code(401);echo json_encode(['success'=>false,'message'=>'Unauthorized']);exit;}

    $input=json_decode(file_get_contents('php://input'),true);
    $action=$input['action']??'';

    if($action==='add_pool'){
        $amount=(float)($input['amount']??0);
        $pass=$input['admin_password']??'';
        if($pass!==$ADMIN_PASSWORD){echo json_encode(['success'=>false,'message'=>'Invalid admin password']);exit;}
        if($amount<=0){echo json_encode(['success'=>false,'message'=>'Invalid amount']);exit;}
        $current=(float)getSetting($db,'month_revenue',0);
        saveSetting($db,'month_revenue',$current+$amount);
        echo json_encode(['success'=>true,'message'=>'Distribution pool updated']);exit;
    }

    if($action==='add_xp'||$action==='remove_xp'){
        $userId=(int)($input['user_id']??0);
        $amount=(int)($input['amount']??0);
        $reason=trim($input['reason']??'');
        $pass=$input['admin_password']??'';
        if($pass!==$ADMIN_PASSWORD){echo json_encode(['success'=>false,'message'=>'Invalid admin password']);exit;}
        if(!$userId||$amount<=0||!$reason){echo json_encode(['success'=>false,'message'=>'User, amount and reason required']);exit;}
        $stmt=$db->prepare("SELECT coins FROM users WHERE id=?");$stmt->execute([$userId]);$user=$stmt->fetch(PDO::FETCH_ASSOC);
        if(!$user){echo json_encode(['success'=>false,'message'=>'User not found']);exit;}
        if($action==='remove_xp'&&(int)$user['coins']<$amount){echo json_encode(['success'=>false,'message'=>'User has insufficient XP']);exit;}
        $delta=$action==='add_xp'?$amount:-$amount;
        $db->prepare("UPDATE users SET coins=coins+? WHERE id=?")->execute([$delta,$userId]);
        $newCoins=(int)$user['coins']+$delta;
        // Log
        try{$db->prepare("INSERT INTO wallet_transactions(user_id,type,amount,status,reference,notes,created_at) VALUES(?,'xp_adjustment',?,'completed',?,?,NOW())")->execute([$userId,abs($amount),'XP-ADJ-'.strtoupper(substr(md5(uniqid()),0,8)),json_encode(['reason'=>$reason,'action'=>$action])]);}catch(Exception $e){}
        echo json_encode(['success'=>true,'message'=>'XP updated','new_coins'=>$newCoins]);exit;
    }

    if($action==='save_settings'){
        saveSetting($db,'xp_min_contribution',$input['min_xp']??250);
        saveSetting($db,'xp_open_day',$input['open_day']??1);
        saveSetting($db,'xp_close_day',$input['close_day']??25);
        saveSetting($db,'xp_dist_day',$input['dist_day']??28);
        echo json_encode(['success'=>true,'message'=>'Settings saved']);exit;
    }

    echo json_encode(['success'=>false,'message'=>'Unknown action']);
}
?>
