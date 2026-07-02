-- BigTenX DB Migration v3
-- Run each statement separately in phpMyAdmin.
-- Ignore "Duplicate column name" or "Table already exists" errors — those mean it already ran, safe to skip.

-- ─── STEP 1: Wallet control columns ───────────────────────────────────────
ALTER TABLE users ADD COLUMN account_status  TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN deposit_status  TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN withdraw_status TINYINT(1) NOT NULL DEFAULT 1;

-- ─── STEP 2: Weekly streak columns ────────────────────────────────────────
ALTER TABLE users ADD COLUMN weekly_claimed_days TEXT NULL;
ALTER TABLE users ADD COLUMN weekly_start DATE NULL;

-- ─── STEP 3: notes on wallet_transactions ─────────────────────────────────
ALTER TABLE wallet_transactions ADD COLUMN notes TEXT NULL;

-- ─── STEP 4: Profile extended fields ─────────────────────────────────────
ALTER TABLE users ADD COLUMN first_name VARCHAR(80) NULL;
ALTER TABLE users ADD COLUMN last_name  VARCHAR(80) NULL;
ALTER TABLE users ADD COLUMN phone      VARCHAR(30) NULL;
ALTER TABLE users ADD COLUMN address    TEXT NULL;
ALTER TABLE users ADD COLUMN dob        DATE NULL;
ALTER TABLE users ADD COLUMN gender     VARCHAR(10) NULL;

-- ─── STEP 5: VIP auto_renew on user_vip ──────────────────────────────────
ALTER TABLE user_vip ADD COLUMN auto_renew TINYINT(1) DEFAULT 0;

-- ─── STEP 6: Tickets table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    subject     VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    status      ENUM('open','replied','closed') DEFAULT 'open',
    admin_reply TEXT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 7: referral_commissions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_commissions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id      INT NOT NULL,
    referred_user_id INT NULL,
    amount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_referrer (referrer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 8: admin_settings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_settings (
    `key`   VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 9: vault_contributions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_contributions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    amount     INT NOT NULL,
    cycle      VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_cycle (cycle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 10: vault_units ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_units (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 11: vault_admin_log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_admin_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    action     VARCHAR(20) NOT NULL DEFAULT 'add',
    amount     DECIMAL(10,2) NOT NULL,
    reason     TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 12: Add status column to vault_contributions ────────────────────
ALTER TABLE vault_contributions ADD COLUMN status ENUM('pending','paid') DEFAULT 'pending';

-- ─── Default admin_settings values (run once) ────────────────────────────
INSERT IGNORE INTO admin_settings (`key`, `value`) VALUES
('vault_unit_price',     '15'),
('vault_basic_limit',    '2'),
('vault_tx_fee',         '2'),
('vault_buy_enabled',    '1'),
('vault_sell_enabled',   '1'),
('xp_min_contribution',  '250'),
('xp_open_day',          '1'),
('xp_close_day',         '25'),
('xp_dist_day',          '28'),
('weekly_daily_xp',      '3'),
('weekly_bonus_xp',      '4'),
('month_revenue',        '0');

-- DONE.
-- Ignore duplicate column / table already exists errors — they mean you already ran that step.
