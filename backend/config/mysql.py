import os
import mysql.connector

DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "admin123"),
    "database": os.getenv("MYSQL_DATABASE", "infinix_db"),
    "auth_plugin": os.getenv("MYSQL_AUTH_PLUGIN", "mysql_native_password"),
    "use_pure": True,
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def get_db_without_database():
    config = DB_CONFIG.copy()
    config.pop("database", None)
    return mysql.connector.connect(**config)
