from flask import Blueprint, request, jsonify
import bcrypt

from config.mysql import get_db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}

    fullname = data.get("fullname", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not fullname or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

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
            "INSERT INTO users (fullname, email, password, role) VALUES (%s, %s, %s, %s)",
            (fullname, email, hashed_password, "user")
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


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

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

        return jsonify({
            "success": True,
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
