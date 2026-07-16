CREATE DATABASE IF NOT EXISTS infinix_db;
USE infinix_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  variant VARCHAR(255) NOT NULL,
  size VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(1024) NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE

);

CREATE TABLE orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL,

    phone VARCHAR(20) NOT NULL,

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(10) NOT NULL,

    payment_method VARCHAR(50) NOT NULL,

    total DECIMAL(10,2) NOT NULL,

    status ENUM(
        'Pending',
        'Confirmed',
        'Packed',
        'Shipped',
        'Delivered',
        'Cancelled'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

INSERT INTO users (fullname, email, password, role)
SELECT 'Infinix Admin', 'admin@infinix.com', '$2b$12$7sJGQiVTsp8DdK9sXNH1eOkbOP3miCh5XBZRQe18FJJFAtHpKVCrK', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@infinix.com');

-- =========================================================
-- AUTH REDESIGN: additive columns only (run once, existing
-- tables/data are untouched). Safe to skip if already applied.
-- =========================================================

-- Enables the new Forgot/Reset Password flow
ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL;
ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL;

-- Enables storing the phone number captured by the redesigned Register form
ALTER TABLE users ADD COLUMN phone VARCHAR(15) NULL;

ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL;
ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL;
ALTER TABLE users ADD COLUMN phone VARCHAR(15) NULL;