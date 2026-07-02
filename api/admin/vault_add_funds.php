<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware.php';
requireAdmin();
if($_SERVER['REQUEST_METHOD']!=='POST'){http_response_code(405);echo json_encode(['success'=>false,'message'=>'POST required']);exit;}
$input=json_decode(file_get_contents('php://input'),true);
$amount=(float)($input['amount']??0);
$reason=trim($input['reason']??'');
if($amount<=0){echo json_encode(['success'=>false,'message'=>'Invalid amount']);exit;}
if(!$reason){echo json_encode(['success'=>false,'message'=>'Reason required']);exit;}
$db=getDB();
try{
    $db->prepare("INSERT INTO admin_settings(`key`,`value`) VALUES('vault_pool',?) ON DUPLICATE KEY UPDATE `value`=`value`+?")->execute([$amount,$amount]);
    try{$db->prepare("CREATE TABLE IF NOT EXISTS admin_vault_log(id INT AUTO_INCREMENT PRIMARY KEY,amount DECIMAL(12,2),reason TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB")->execute();}catch(Exception$e){}
    try{$db->prepare("INSERT INTO admin_vault_log(amount,reason) VALUES(?,?)")->execute([$amount,$reason]);}catch(Exception$e){}
    echo json_encode(['success'=>true,'message'=>"Added \${$amount} to vault pool"]);
}catch(Exception$e){echo json_encode(['success'=>false,'message'=>$e->getMessage()]);}
?>
