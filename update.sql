-- ============================================================
-- BIGTENX — Full Migration Script
-- Run this on your cPanel MySQL database (bigtenxc_bigtenx_db)
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- 1. Fix admin_tasks.type ENUM to include 'daily' and 'hot'
ALTER TABLE admin_tasks
  MODIFY COLUMN type ENUM('social','video','survey','install','daily','hot') DEFAULT 'daily';

-- 2. Add missing columns to admin_tasks
ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS reward_type ENUM('xp','cash') DEFAULT 'xp',
  ADD COLUMN IF NOT EXISTS apply_multiplier TINYINT(1) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS steps TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS expires_at DATETIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_users INT DEFAULT NULL;

-- 3. Ensure code_type and verify_code columns exist
ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS code_type ENUM('universal','individual') DEFAULT 'universal',
  ADD COLUMN IF NOT EXISTS verify_code VARCHAR(20) DEFAULT NULL;

-- 4. Change default signup coins to 5
ALTER TABLE users MODIFY COLUMN coins INT DEFAULT 5;

-- 5. Create task_codes table if not exists
CREATE TABLE IF NOT EXISTS task_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  used_by INT DEFAULT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (task_id) REFERENCES admin_tasks(id) ON DELETE CASCADE
);

-- 6. Create task_completions table if not exists
CREATE TABLE IF NOT EXISTS task_completions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  code_used VARCHAR(20),
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_completion (user_id, task_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES admin_tasks(id)
);

-- 7. Create level_packages if not exists
CREATE TABLE IF NOT EXISTS level_packages (
  id INT PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  daily_coins INT NOT NULL,
  referral_bonus VARCHAR(20) NOT NULL,
  badge VARCHAR(20) NOT NULL,
  commission INT NOT NULL,
  vip_months INT DEFAULT 0
);

INSERT INTO level_packages (id, name, price, daily_coins, referral_bonus, badge, commission, vip_months) VALUES
  (1, 'Bronze',   1.00,  50, '100 coins', 'Bronze',  20, 0),
  (2, 'Silver',   5.00, 100, '$2',        'Silver',  30, 0),
  (3, 'Gold',    10.00, 150, '$4',        'Gold',    40, 0),
  (4, 'Diamond', 20.00, 200, '$10',       'Diamond', 50, 1)
ON DUPLICATE KEY UPDATE
  price=VALUES(price), daily_coins=VALUES(daily_coins),
  referral_bonus=VALUES(referral_bonus), badge=VALUES(badge),
  commission=VALUES(commission), vip_months=VALUES(vip_months);

-- 8. Add today_earnings columns to users table (for dashboard display)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS today_earnings INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS today_earnings_date DATE DEFAULT NULL;

-- 9. Upgrade test users to Level 1 (Bronze) — update emails as needed
UPDATE users
SET level = 1,
    level_paid = 1,
    level_expires = DATE_ADD(NOW(), INTERVAL 1 MONTH)
WHERE email IN ('babafemiolawuni@gmail.com', 'my2027plan@gmail.com');
