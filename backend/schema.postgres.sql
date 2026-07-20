-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- The database itself already exists in Supabase, so there's no
-- CREATE DATABASE / USE step like there was in MySQL.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(15) NULL,
    reset_token VARCHAR(64) NULL,
    reset_token_expiry TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MySQL's ENUM becomes a plain Postgres type here, checked with a
-- CHECK constraint so it's trivial to alter later (Postgres ENUM types
-- are annoying to modify; a CHECK constraint isn't).
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending','Confirmed','Packed','Shipped','Delivered','Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Default admin user (same bcrypt hash as before — change this password
-- after your first login in a real deployment).
INSERT INTO users (fullname, email, password, role)
SELECT 'Infinix Admin', 'admin@infinix.com',
       '$2b$12$7sJGQiVTsp8DdK9sXNH1eOkbOP3miCh5XBZRQe18FJJFAtHpKVCrK', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@infinix.com');
