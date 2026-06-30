<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure admin_settings table exists
try {
    $db->exec("CREATE TABLE IF NOT EXISTS admin_settings (
        `key`   VARCHAR(100) PRIMARY KEY,
        `value` TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

// GET: return all XP/badge/VIP settings
if ($method === 'GET') {
    function getSetting($db, $key, $default) {
        try {
            $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key` = ?");
            $s->execute([$key]);
            $v = $s->fetchColumn();
            return $v !== false ? json_decode($v, true) : $default;
        } catch (Exception $e) { return $default; }
    }

    $rewards = getSetting($db, 'xp_rewards', ['signupXP' => 5, 'weeklyDailyXP' => 3, 'weeklyBonusXP' => 4]);
    $badges  = getSetting($db, 'badge_config', null);
    $vip     = getSetting($db, 'vip_config', ['price' => 10, 'boost' => 20, 'referralBonus' => 1, 'duration' => 30, 'benefits' => []]);

    echo json_encode(['success' => true, 'rewards' => $rewards, 'badges' => $badges, 'vip' => $vip]);
    exit;
}

// POST: save a section
if ($method === 'POST') {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (strlen($token) < 10) { http_response_code(401); echo json_encode(['success' => false, 'message' => 'Unauthorized']); exit; }

    $input   = json_decode(file_get_contents('php://input'), true);
    $section = $input['section'] ?? '';
    $data    = $input['data']    ?? [];

    $keyMap  = ['rewards' => 'xp_rewards', 'badge' => 'badge_config', 'vip' => 'vip_config'];

    if ($section === 'badge') {
        // Merge single badge into full badge config
        $all = null;
        try {
            $s = $db->prepare("SELECT `value` FROM admin_settings WHERE `key` = 'badge_config'");
            $s->execute(); $v = $s->fetchColumn();
            $all = $v !== false ? json_decode($v, true) : [];
        } catch (Exception $e) { $all = []; }
        if (!is_array($all)) $all = [];
        $all[$data['name']] = $data;
        $db->prepare("INSERT INTO admin_settings (`key`, `value`) VALUES ('badge_config', ?) ON DUPLICATE KEY UPDATE `value` = ?")
           ->execute([json_encode($all), json_encode($all)]);
        echo json_encode(['success' => true, 'message' => "{$data['name']} badge saved"]);
        exit;
    }

    if (isset($keyMap[$section])) {
        $key = $keyMap[$section];
        $db->prepare("INSERT INTO admin_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?")
           ->execute([$key, json_encode($data), json_encode($data)]);

        // Also update weekly XP in dedicated keys for streak/claim.php to read
        if ($section === 'rewards') {
            foreach (['weekly_daily_xp' => $data['weeklyDailyXP'] ?? 3, 'weekly_bonus_xp' => $data['weeklyBonusXP'] ?? 4] as $k => $v) {
                $db->prepare("INSERT INTO admin_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?")
                   ->execute([$k, $v, $v]);
            }
        }
        echo json_encode(['success' => true, 'message' => ucfirst($section) . ' settings saved']);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown section']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed']);
?>
