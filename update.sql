-- ============================================================
-- BIGTENX — Master Migration (MySQL 5.7 compatible)
-- Run each block separately in phpMyAdmin SQL tab
-- Ignore "Duplicate column name" errors — they're harmless
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- BLOCK 1: Fix admin_tasks type column
-- ══════════════════════════════════════════════════════════════
ALTER TABLE admin_tasks
  MODIFY COLUMN type ENUM('social','video','survey','install','daily','hot') DEFAULT 'daily';


-- ══════════════════════════════════════════════════════════════
-- BLOCK 2: admin_tasks — add optional columns one by one
-- Run each line separately. Ignore "Duplicate column" errors.
-- ══════════════════════════════════════════════════════════════
ALTER TABLE admin_tasks ADD COLUMN reward_type ENUM('xp','cash') DEFAULT 'xp';
ALTER TABLE admin_tasks ADD COLUMN apply_multiplier TINYINT(1) DEFAULT 1;
ALTER TABLE admin_tasks ADD COLUMN steps TEXT DEFAULT NULL;
ALTER TABLE admin_tasks ADD COLUMN expires_at DATETIME DEFAULT NULL;
ALTER TABLE admin_tasks ADD COLUMN max_users INT DEFAULT NULL;
ALTER TABLE admin_tasks ADD COLUMN code_type ENUM('universal','individual') DEFAULT 'universal';
ALTER TABLE admin_tasks ADD COLUMN verify_code VARCHAR(20) DEFAULT NULL;
ALTER TABLE admin_tasks ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


-- ══════════════════════════════════════════════════════════════
-- BLOCK 3: users — add optional columns one by one
-- Ignore "Duplicate column" errors.
-- ══════════════════════════════════════════════════════════════
ALTER TABLE users ADD COLUMN today_earnings INT DEFAULT 0;
ALTER TABLE users ADD COLUMN today_earnings_date DATE DEFAULT NULL;
ALTER TABLE users ADD COLUMN referred_by INT DEFAULT NULL;
ALTER TABLE users ADD COLUMN referral_earnings DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN total_referrals INT DEFAULT 0;
ALTER TABLE users ADD COLUMN level_expires DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN vip_expiry DATETIME DEFAULT NULL;


-- ══════════════════════════════════════════════════════════════
-- BLOCK 4: Create task_completions table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS task_completions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  task_id      INT NOT NULL,
  code_used    VARCHAR(20),
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_completion (user_id, task_id)
);

-- ══════════════════════════════════════════════════════════════
-- BLOCK 4b: daily_task_attempts (24-hour timer per user)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_task_attempts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  task_id    INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  completed  TINYINT(1) DEFAULT 0,
  UNIQUE KEY unique_attempt (user_id, task_id)
);


-- ══════════════════════════════════════════════════════════════
-- BLOCK 5: Create task_codes table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS task_codes (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  code    VARCHAR(20) NOT NULL UNIQUE,
  used_by INT DEFAULT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL
);


-- ══════════════════════════════════════════════════════════════
-- BLOCK 6: Create referral_commissions table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS referral_commissions (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id             INT           NOT NULL,
  referred_user_id        INT           NOT NULL,
  amount                  DECIMAL(10,2) NOT NULL,
  commission_percentage   INT           NOT NULL,
  referrer_plan_at_time   VARCHAR(50)   DEFAULT NULL,
  referred_upgrade_amount DECIMAL(10,2) DEFAULT NULL,
  created_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ══════════════════════════════════════════════════════════════
-- BLOCK 7: Create admin_settings table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admin_settings (
  `key`      VARCHAR(100) PRIMARY KEY,
  `value`    TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ══════════════════════════════════════════════════════════════
-- BLOCK 8: Create level_packages table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS level_packages (
  id             INT PRIMARY KEY,
  name           VARCHAR(20)   NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  daily_coins    INT           NOT NULL,
  referral_bonus VARCHAR(20)   NOT NULL,
  badge          VARCHAR(20)   NOT NULL,
  commission     INT           NOT NULL,
  vip_months     INT DEFAULT 0
);

INSERT IGNORE INTO level_packages VALUES
  (1, 'Bronze',   1.00,  50, '100 coins', 'Bronze',  20, 0),
  (2, 'Silver',   5.00, 100, '$2',        'Silver',  30, 0),
  (3, 'Gold',    10.00, 150, '$4',        'Gold',    40, 0),
  (4, 'Diamond', 20.00, 200, '$10',       'Diamond', 50, 1);


-- ══════════════════════════════════════════════════════════════
-- BLOCK 9: Indexes (ignore errors if they already exist)
-- ══════════════════════════════════════════════════════════════
ALTER TABLE users ADD INDEX idx_referred_by (referred_by);
ALTER TABLE admin_tasks ADD INDEX idx_tasks_active (active, type);


-- ══════════════════════════════════════════════════════════════
-- DONE — Verify with these SELECT statements:
-- ══════════════════════════════════════════════════════════════

-- Check admin_tasks columns:
-- SHOW COLUMNS FROM admin_tasks;

-- Check users columns:
-- SHOW COLUMNS FROM users;

-- Check type ENUM includes daily and hot:
-- SELECT COLUMN_TYPE FROM information_schema.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = 'admin_tasks'
--   AND COLUMN_NAME = 'type';
