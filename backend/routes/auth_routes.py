import re
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.utils import formataddr

import bcrypt
import secrets
from flask import Blueprint, request, jsonify

from config import settings
from config.db import get_db
from extensions import limiter
from utils.auth import generate_token

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[a-z0-9][a-z0-9._%+-]{1,29}@gmail\.com$")
MIN_PASSWORD_LENGTH = 8


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.json or {}

    fullname = data.get("fullname", "").strip()
    raw_email = data.get("email", "").strip()
    password = data.get("password", "")

    if raw_email != raw_email.lower():
        return jsonify({
            "success": False,
            "message": "Email must be in lowercase only."
        }), 400

    email = raw_email.lower()
    # phone is accepted from the redesigned Register form but not yet
    # persisted — add a `phone VARCHAR(15)` column to `users` (see
    # schema.sql) and an INSERT param below to store it.
    phone = data.get("phone", "").strip()

    if not fullname or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"success": False, "message": "Enter a valid Gmail address (e.g. name@gmail.com)."}), 400


    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({
            "success": False,
            "message": f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
        }), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Email already exists."}), 409

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            "INSERT INTO users (fullname, email, password, role, phone) VALUES (%s, %s, %s, %s, %s)",
            (fullname, email, hashed_password, "user", phone or None)
        )
        conn.commit()

        return jsonify({"success": True, "message": "Registration successful."})

    except Exception as exc:
        print("Register error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


RESET_TOKEN_TTL_MINUTES = 30


def send_reset_email(to_email, token):
    """
    Emails the password reset link to the user. Raises on failure so the
    caller can decide how to handle it (we still return success to the
    client either way, to avoid leaking which emails are registered).
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"

    body = (
        "We received a request to reset your Infinix account password.\n\n"
        f"Reset your password using this link (valid for {RESET_TOKEN_TTL_MINUTES} minutes):\n"
        f"{reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email."
    )

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = "Reset your Infinix password"
    msg["From"] = formataddr(("Infinix", settings.SMTP_FROM_EMAIL))
    msg["To"] = to_email

    if settings.SMTP_PORT == 465:
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
    else:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

    try:
        if settings.SMTP_PORT != 465:
            server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
    finally:
        server.quit()


@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("5 per hour")
def forgot_password():
    """
    Generates a single-use reset token and (in a real deployment) emails
    a link like /reset-password/<token> to the user.

    Requires two additive columns on `users`:
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL;
        ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL;

    Always returns success=True (even for unknown emails) so the
    endpoint can't be used to enumerate registered accounts.
    """
    data = request.json or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            token = secrets.token_urlsafe(32)
            expiry = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)

            cursor.execute(
                "UPDATE users SET reset_token = %s, reset_token_expiry = %s WHERE id = %s",
                (token, expiry, user["id"])
            )
            conn.commit()

            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                try:
                    send_reset_email(email, token)
                except Exception as email_exc:
                    # Don't fail the request over an email-delivery issue --
                    # log it and still return a generic success message.
                    print("Password reset email send error:", email_exc)
            else:
                # Local/dev fallback when SMTP isn't configured.
                print(f"[password-reset] SMTP not configured. Token for {email}: {token}")

        return jsonify({
            "success": True,
            "message": "If an account exists for that email, a reset link has been sent."
        })

    except Exception as exc:
        print("Forgot password error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("10 per hour")
def reset_password():
    data = request.json or {}
    token = data.get("token", "").strip()
    password = data.get("password", "")

    if not token or not password:
        return jsonify({"success": False, "message": "Token and new password are required."}), 400

    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({
            "success": False,
            "message": f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
        }), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, reset_token_expiry FROM users WHERE reset_token = %s",
            (token,)
        )
        user = cursor.fetchone()

        if not user or not user["reset_token_expiry"] or user["reset_token_expiry"] < datetime.utcnow():
            return jsonify({
                "success": False,
                "message": "This reset link is invalid or has expired."
            }), 400

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            "UPDATE users SET password = %s, reset_token = NULL, reset_token_expiry = NULL WHERE id = %s",
            (hashed_password, user["id"])
        )
        conn.commit()

        return jsonify({"success": True, "message": "Password reset successful."})

    except Exception as exc:
        print("Reset password error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.json or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, fullname, email, password, role FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"success": False, "message": "Invalid email or password."}), 401

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({"success": False, "message": "Invalid email or password."}), 401

        token = generate_token(user)

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "fullname": user["fullname"],
                "email": user["email"],
                "role": user["role"]
            }
        })

    except Exception as exc:
        print("Login error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
