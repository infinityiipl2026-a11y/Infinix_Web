from flask import Blueprint, request, jsonify
from functools import wraps

from config.mysql import get_db

admin_bp = Blueprint("admin", __name__)


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_role = request.headers.get("X-User-Role", "")
        if user_role != "admin":
            return jsonify({"success": False, "message": "Admin access required."}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route("/admin", methods=["GET"])
@admin_required
def admin_dashboard():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products ORDER BY id DESC")
        products = cursor.fetchall()
        return jsonify({"success": True, "products": products})
    except Exception as exc:
        print("Admin dashboard error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
