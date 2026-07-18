from config.mysql import get_db_without_database, DB_CONFIG
import mysql.connector

SCHEMA_SQL = """
CREATE DATABASE IF NOT EXISTS infinix_db;
USE infinix_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(15) NULL,
    reset_token VARCHAR(64) NULL,
    reset_token_expiry DATETIME NULL
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

CREATE TABLE IF NOT EXISTS orders (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
"""


def initialize_database():
    conn = None
    cursor = None

    try:
        conn = get_db_without_database()
        cursor = conn.cursor()

        # Execute each SQL statement
        for statement in SCHEMA_SQL.split(";"):
            statement = statement.strip()
            if statement:
                cursor.execute(statement)

        conn.commit()

        if cursor:
            cursor.close()
        if conn:
            conn.close()

        # Connect to the created database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        # Create default admin if not exists
        cursor.execute(
            "SELECT COUNT(*) AS count FROM users WHERE email=%s",
            ("admin@infinix.com",)
        )

        result = cursor.fetchone()

        if result["count"] == 0:

            cursor.execute(
                """
                INSERT INTO users
                (fullname,email,password,role)
                VALUES
                (%s,%s,%s,%s)
                """,
                (
                    "Infinix Admin",
                    "admin@infinix.com",
                    "$2b$12$7sJGQiVTsp8DdK9sXNH1eOkbOP3miCh5XBZRQe18FJJFAtHpKVCrK",
                    "admin"
                )
            )

            conn.commit()

        print("Database initialized successfully.")

    except Exception as exc:

        print("Database initialization error:", exc)

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()