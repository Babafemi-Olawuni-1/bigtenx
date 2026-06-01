-- ============================================================
-- BIGTENX — Initial Schema Setup
-- Run once on a fresh database
-- ============================================================

-- Admin tasks table (full schema)
CREATE TABLE IF NOT EXISTS admin_tasks (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  type             ENUM('social','video','survey','install','daily','hot') DEFAULT 'daily',
  platform         VARCHAR(50)  DEFAULT '',
  url              VARCHAR(500) NOT NULL,
  reward_xp        INT          DEFAULT 10,
  reward_type      ENUM('xp','cash') DEFAULT 'xp',
  apply_multiplier TINYINT(1)   DEFAULT 1,
  code_type        ENUM('universal','individual') DEFAULT 'universal',
  verify_code      VARCHAR(20)  DEFAULT NULL,
  steps            TEXT         DEFAULT NULL,   -- JSON array of step objects
  expires_at       DATETIME     DEFAULT NULL,   -- hot offers: expiry timestamp
  max_users        INT          DEFAULT NULL,   -- hot offers: participant cap
  active           TINYINT(1)   DEFAULT 1,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Individual codes pool (used when code_type = 'individual')
CREATE TABLE IF NOT EXISTS task_codes (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  task_id  INT NOT NULL,
  code     VARCHAR(20) NOT NULL UNIQUE,
  used_by  INT DEFAULT NULL,
  used_at  TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (task_id) REFERENCES admin_tasks(id) ON DELETE CASCADE
);

-- Task completions log
CREATE TABLE IF NOT EXISTS task_completions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  task_id      INT NOT NULL,
  code_used    VARCHAR(20),
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_completion (user_id, task_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES admin_tasks(id)
);

-- Level packages
CREATE TABLE IF NOT EXISTS level_packages (
  id             INT PRIMARY KEY,
  name           VARCHAR(20)    NOT NULL,
  price          DECIMAL(10,2)  NOT NULL,
  daily_coins    INT            NOT NULL,
  referral_bonus VARCHAR(20)    NOT NULL,
  badge          VARCHAR(20)    NOT NULL,
  commission     INT            NOT NULL,
  vip_months     INT            DEFAULT 0
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
