import os

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import pooling

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "infinix_db"),
    "auth_plugin": os.getenv("MYSQL_AUTH_PLUGIN", "mysql_native_password"),
    "use_pure": True,
}

if not DB_CONFIG["password"]:
    print(
        "WARNING: MYSQL_PASSWORD is empty. Set MYSQL_PASSWORD in your .env "
        "file — do not run against a production database with no password."
    )

_pool = None


def _get_pool():
    """
    Lazily create a connection pool on first use, instead of opening a new
    TCP connection to MySQL on every single request (what the original code
    did). Pool size is configurable via DB_POOL_SIZE.
    """
    global _pool
    if _pool is None:
        pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
        _pool = pooling.MySQLConnectionPool(
            pool_name="infinix_pool",
            pool_size=pool_size,
            **DB_CONFIG,
        )
    return _pool


def get_db():
    """Get a pooled connection to the configured database."""
    return _get_pool().get_connection()


def get_db_without_database():
    """
    Connect to the MySQL server without selecting a database — only used by
    the one-time schema bootstrap (models/db_init.py) before the database
    exists. Not pooled, since it's called rarely.
    """
    config = DB_CONFIG.copy()
    config.pop("database", None)
    return mysql.connector.connect(**config)
