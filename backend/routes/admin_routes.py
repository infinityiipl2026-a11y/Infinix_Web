from flask import Blueprint, jsonify

from config.mysql import get_db
from utils.auth import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin", methods=["GET"])
@admin_required
def admin_dashboard():
    conn = None
    cursor = None
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
