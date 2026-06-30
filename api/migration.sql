-- BigTenX DB Migration v2
-- Run each statement separately in phpMyAdmin. Ignore "Duplicate column" errors — that means it already exists.

-- STEP 1: Wallet control columns
ALTER TABLE users ADD COLUMN account_status  TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN deposit_status  TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN withdraw_status TINYINT(1) NOT NULL DEFAULT 1;

-- STEP 2: Weekly streak columns
ALTER TABLE users ADD COLUMN weekly_claimed_days TEXT NULL;
ALTER TABLE users ADD COLUMN weekly_start DATE NULL;

-- STEP 3: notes column on wallet_transactions
ALTER TABLE wallet_transactions ADD COLUMN notes TEXT NULL;

-- STEP 4: Profile extended fields
ALTER TABLE users ADD COLUMN first_name VARCHAR(80) NULL;
ALTER TABLE users ADD COLUMN last_name  VARCHAR(80) NULL;
ALTER TABLE users ADD COLUMN phone      VARCHAR(30) NULL;
ALTER TABLE users ADD COLUMN address    TEXT NULL;
ALTER TABLE users ADD COLUMN dob        DATE NULL;
ALTER TABLE users ADD COLUMN gender     VARCHAR(10) NULL;

-- STEP 5: tickets table
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

-- STEP 6: referral_commissions table
CREATE TABLE IF NOT EXISTS referral_commissions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id      INT NOT NULL,
    referred_user_id INT NULL,
    amount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_referrer (referrer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 7: admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    `key`   VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DONE. Ignore "Duplicate column name" errors on ALTER statements — safe to skip those.
