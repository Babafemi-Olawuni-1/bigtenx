-- BigTenX DB Migration
-- Run each block separately in phpMyAdmin if one fails (it may mean the column already exists — that's OK)
-- Go to: phpMyAdmin → bigtenxc_bigtenx_db → SQL tab → paste and run

-- ─────────────────────────────────────────────────────────────────
-- STEP 1: Add account_status to users
-- (Skip/ignore if error: "Duplicate column name")
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN account_status TINYINT(1) NOT NULL DEFAULT 1;

-- ─────────────────────────────────────────────────────────────────
-- STEP 2: Add deposit_status to users
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN deposit_status TINYINT(1) NOT NULL DEFAULT 1;

-- ─────────────────────────────────────────────────────────────────
-- STEP 3: Add withdraw_status to users
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN withdraw_status TINYINT(1) NOT NULL DEFAULT 1;

-- ─────────────────────────────────────────────────────────────────
-- STEP 4: Add notes column to wallet_transactions
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE wallet_transactions ADD COLUMN notes TEXT NULL;

-- ─────────────────────────────────────────────────────────────────
-- STEP 5: Create tickets table
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    subject      VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    status       ENUM('open','replied','closed') DEFAULT 'open',
    admin_reply  TEXT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- STEP 6: Create referral_commissions table
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_commissions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id      INT NOT NULL,
    referred_user_id INT NULL,
    amount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_referrer (referrer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- DONE. 
-- If steps 1-4 show "Duplicate column name" errors, it means those
-- columns already exist — that is fine, skip those steps.
-- ─────────────────────────────────────────────────────────────────
