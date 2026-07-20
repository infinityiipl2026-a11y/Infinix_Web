import os

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# Get this from Supabase: Project Settings -> Database -> Connection string.
# IMPORTANT: use the "Transaction pooler" URI (port 6543), not the direct
# connection (port 5432). This app runs on Vercel serverless functions,
# which open a fresh connection per cold start — the direct connection
# limit on a small Supabase project (usually ~60) gets exhausted almost
# immediately without the pooler. The transaction pooler is built for
# exactly this (many short-lived serverless connections).
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Copy the connection string from Supabase "
        "(Project Settings -> Database -> Connection string -> Transaction "
        "pooler) into your .env file."
    )

_pool = None


def _get_pool():
    """
    Lazily create a small connection pool on first use. Kept small on
    purpose — Supabase's pooler already multiplexes connections for you,
    and serverless functions only need 1-2 connections per warm instance.
    """
    global _pool
    if _pool is None:
        pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
        _pool = psycopg2.pool.ThreadedConnectionPool(
            1, pool_size, dsn=DATABASE_URL
        )
    return _pool


class PooledConnection:
    """
    Thin wrapper so route code doesn't need to change:
      - conn.cursor(dictionary=True) still works (the `dictionary` kwarg is
        accepted and ignored — every cursor from here returns dict-like rows
        via RealDictCursor, matching what mysql.connector's dictionary=True
        used to give you).
      - conn.close() returns the connection to the pool instead of actually
        closing the socket, so existing `finally: conn.close()` blocks in
        the routes keep working unmodified.
    """

    def __init__(self, conn):
        self._conn = conn

    def cursor(self, *args, **kwargs):
        kwargs.pop("dictionary", None)
        kwargs.setdefault("cursor_factory", RealDictCursor)
        return self._conn.cursor(*args, **kwargs)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        _get_pool().putconn(self._conn)


def get_db():
    """Get a pooled connection to Supabase Postgres."""
    conn = _get_pool().getconn()
    return PooledConnection(conn)
