-- Stock Analyzer Database Initialization Script
-- This script runs when MySQL container starts for the first time

-- Create database if not exists (already created by MYSQL_DATABASE env var)
-- USE stock_analyzer;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portfolio holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    average_cost DECIMAL(18, 4) NOT NULL,
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    INDEX idx_portfolio_id (portfolio_id),
    INDEX idx_ticker (ticker),
    UNIQUE KEY unique_portfolio_ticker (portfolio_id, ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Watchlist items table
CREATE TABLE IF NOT EXISTS watchlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    watchlist_id INT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    target_price DECIMAL(18, 4),
    alert_above DECIMAL(18, 4),
    alert_below DECIMAL(18, 4),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
    INDEX idx_watchlist_id (watchlist_id),
    INDEX idx_ticker (ticker),
    UNIQUE KEY unique_watchlist_ticker (watchlist_id, ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table (buy/sell history)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    portfolio_id INT,
    ticker VARCHAR(10) NOT NULL,
    transaction_type ENUM('BUY', 'SELL', 'DIVIDEND') NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 4) NOT NULL,
    total_amount DECIMAL(18, 4) NOT NULL,
    fees DECIMAL(18, 4) DEFAULT 0,
    transaction_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_portfolio_id (portfolio_id),
    INDEX idx_ticker (ticker),
    INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Predictions history table
CREATE TABLE IF NOT EXISTS prediction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ticker VARCHAR(10) NOT NULL,
    prediction_date DATE NOT NULL,
    target_date DATE NOT NULL,
    predicted_price DECIMAL(18, 4) NOT NULL,
    actual_price DECIMAL(18, 4),
    confidence DECIMAL(5, 4),
    model_type VARCHAR(50),
    trend VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ticker (ticker),
    INDEX idx_prediction_date (prediction_date),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    alert_type ENUM('PRICE_ABOVE', 'PRICE_BELOW', 'PERCENT_CHANGE', 'PREDICTION') NOT NULL,
    threshold_value DECIMAL(18, 4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_ticker (ticker),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table (for JWT refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_refresh_token (refresh_token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock cache table (for caching API responses)
CREATE TABLE IF NOT EXISTS stock_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    cache_type ENUM('QUOTE', 'PROFILE', 'HISTORICAL', 'NEWS') NOT NULL,
    data JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ticker_type (ticker, cache_type),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (email, username, password_hash, first_name, last_name, is_admin)
VALUES ('admin@stockanalyzer.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.V4ferR5.p7zOXi', 'Admin', 'User', TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- Create default portfolio for admin
INSERT INTO portfolios (user_id, name, description, is_default)
SELECT id, 'Default Portfolio', 'My main investment portfolio', TRUE
FROM users WHERE username = 'admin'
ON DUPLICATE KEY UPDATE name = name;

-- Create default watchlist for admin
INSERT INTO watchlists (user_id, name, description)
SELECT id, 'My Watchlist', 'Stocks I am watching'
FROM users WHERE username = 'admin'
ON DUPLICATE KEY UPDATE name = name;

COMMIT;
