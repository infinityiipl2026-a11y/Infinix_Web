from config.db import get_db

ADMIN_EMAIL = "admin@infinix.com"
ADMIN_PASSWORD_HASH = "$2b$12$7sJGQiVTsp8DdK9sXNH1eOkbOP3miCh5XBZRQe18FJJFAtHpKVCrK"


def initialize_database():
    """
    Table creation now lives in schema.postgres.sql -- run that once in the
    Supabase SQL editor before deploying. This function only seeds the
    default admin user, and only runs if AUTO_CREATE_SCHEMA is enabled
    (see config/settings.py) -- it's a convenience for local dev, not a
    substitute for the schema migration.
    """
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT COUNT(*) AS count FROM users WHERE email = %s",
            (ADMIN_EMAIL,)
        )
        result = cursor.fetchone()

        if result["count"] == 0:
            cursor.execute(
                """
                INSERT INTO users (fullname, email, password, role)
                VALUES (%s, %s, %s, %s)
                """,
                ("Infinix Admin", ADMIN_EMAIL, ADMIN_PASSWORD_HASH, "admin")
            )
            conn.commit()

        print("Database check complete (admin user ensured).")

    except Exception as exc:
        print("Database initialization error:", exc)
        print(
            "If this is a 'relation users does not exist' error, you "
            "still need to run schema.postgres.sql in the Supabase SQL "
            "editor first."
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
