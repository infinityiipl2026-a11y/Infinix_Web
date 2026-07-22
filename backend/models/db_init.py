import os

import bcrypt

from config.db import get_db

# SECURITY NOTE: this file used to hardcode ADMIN_EMAIL and a bcrypt hash of
# the admin password directly in source, which was committed to a public
# GitHub repo -- meaning the hash (and therefore the password, if it was
# ever weak/reused) was exposed to anyone who cloned the repo, even after
# being removed from a later commit (it stays in git history). Treat that
# original password as compromised: rotate it.
#
# The admin account is now seeded from environment variables instead:
#   ADMIN_EMAIL            e.g. admin@infinix.com
#   ADMIN_PASSWORD         a plaintext password, hashed at startup below
#                          (never store the plaintext anywhere else)
#
# If these aren't set, no admin user is seeded automatically -- create one
# directly in the database instead of relying on a predictable default.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


def initialize_database():
    """
    Table creation now lives in schema.postgres.sql -- run that once in the
    Supabase SQL editor before deploying. This function only seeds the
    default admin user, and only runs if AUTO_CREATE_SCHEMA is enabled
    (see config/settings.py) -- it's a convenience for local dev, not a
    substitute for the schema migration.
    """
    if not (ADMIN_EMAIL and ADMIN_PASSWORD):
        print(
            "Admin seed skipped: ADMIN_EMAIL / ADMIN_PASSWORD not set in "
            "environment. Set both to seed a default admin user, or create "
            "one directly in the database."
        )
        return

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
            password_hash = bcrypt.hashpw(
                ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8")

            cursor.execute(
                """
                INSERT INTO users (fullname, email, password, role)
                VALUES (%s, %s, %s, %s)
                """,
                ("Infinix Admin", ADMIN_EMAIL, password_hash, "admin")
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
