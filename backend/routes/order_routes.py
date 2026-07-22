from flask import Blueprint, request, jsonify

from config.db import get_db
from utils.auth import admin_required, token_required

order_bp = Blueprint("orders", __name__)

VALID_STATUSES = {
    "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"
}


@order_bp.route("/place-order", methods=["POST"])
@token_required
def place_order():

    data = request.json or {}

    required_fields = [
        "user_id", "full_name", "email", "phone",
        "address", "city", "state", "pincode", "payment_method"
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"{field} is required."
            }), 400

    # A user can only place an order on their own behalf.
    if (
        request.current_user["role"] != "admin"
        and request.current_user["id"] != int(data["user_id"])
    ):
        return jsonify({"success": False, "message": "Access denied."}), 403

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT c.product_id, c.quantity, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = %s
            """,
            (data["user_id"],)
        )
        cart_items = cursor.fetchall()

        if len(cart_items) == 0:
            return jsonify({"success": False, "message": "Cart is empty."}), 400

        total = sum(item["price"] * item["quantity"] for item in cart_items)

        cursor.execute(
            """
            INSERT INTO orders
            (user_id, full_name, email, phone, address, city, state,
             pincode, payment_method, total)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
            """,
            (
                data["user_id"], data["full_name"], data["email"], data["phone"],
                data["address"], data["city"], data["state"], data["pincode"],
                data["payment_method"], total
            )
        )

        order_id = cursor.fetchone()["id"]

        for item in cart_items:
            cursor.execute(
                """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s,%s,%s,%s)
                """,
                (order_id, item["product_id"], item["quantity"], item["price"])
            )

        cursor.execute("DELETE FROM cart WHERE user_id=%s", (data["user_id"],))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Order placed successfully.",
            "order_id": order_id
        })

    except Exception as exc:
        print("Place order error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@order_bp.route("/my-orders/<int:user_id>", methods=["GET"])
@token_required
def my_orders(user_id):
    if request.current_user["role"] != "admin" and request.current_user["id"] != user_id:
        return jsonify({"success": False, "message": "Access denied."}), 403

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM orders WHERE user_id=%s ORDER BY created_at DESC",
            (user_id,)
        )
        orders = cursor.fetchall()

        if orders:
            order_ids = tuple(order["id"] for order in orders)

            cursor.execute(
                """
                SELECT
                    oi.order_id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    p.name AS product_name
                FROM order_items oi
                LEFT JOIN products p
                    ON oi.product_id = p.id
                WHERE oi.order_id IN %s
                """,
                (order_ids,)
            )

            items_by_order = {}

            for row in cursor.fetchall():
                items_by_order.setdefault(row["order_id"], []).append({
                    "product_id": row["product_id"],
                    "product_name": row["product_name"] or "Deleted Product",
                    "quantity": row["quantity"],
                    "price": row["price"]
                })

            for order in orders:
                order["items"] = items_by_order.get(order["id"], [])

        return jsonify({
            "success": True,
            "orders": orders
        })

    except Exception as exc:
        print("My orders error:", exc)
        return jsonify({
            "success": False,
            "message": "Server error."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@order_bp.route("/orders", methods=["GET"])
@admin_required
def all_orders():
    # Previously unauthenticated — this leaked every customer's name,
    # email, phone, and address to anyone who hit the endpoint.
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
        orders = cursor.fetchall()

        if orders:
            order_ids = tuple(o["id"] for o in orders)
            cursor.execute(
                """
                SELECT oi.order_id, oi.product_id, oi.quantity, oi.price,
                       p.name AS product_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id IN %s
                """,
                (order_ids,)
            )
            items_by_order = {}
            for row in cursor.fetchall():
                items_by_order.setdefault(row["order_id"], []).append({
                    "product_id": row["product_id"],
                    "product_name": row["product_name"] or "Deleted Product",
                    "quantity": row["quantity"],
                    "price": row["price"]
                })

            for order in orders:
                order["items"] = items_by_order.get(order["id"], [])

        return jsonify({"success": True, "orders": orders})
    except Exception as exc:
        print("All orders error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@order_bp.route("/admin/analytics", methods=["GET"])
@admin_required
def admin_analytics():
    """
    Aggregated stats for the admin analytics dashboard: revenue, order
    counts by status, top-selling products, and a day-by-day trend for
    the last 30 days. Computed in SQL rather than in the client so it
    stays accurate and fast even as the orders table grows.
    """
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(total), 0) AS total_revenue,
                COALESCE(AVG(total), 0) AS avg_order_value
            FROM orders
            WHERE status != 'Cancelled'
            """
        )
        summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT COALESCE(status, 'Pending') AS status, COUNT(*) AS count
            FROM orders
            GROUP BY status
            """
        )
        status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}

        cursor.execute(
            """
            SELECT p.id, p.name, SUM(oi.quantity) AS units_sold,
                   SUM(oi.quantity * oi.price) AS revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'Cancelled'
            GROUP BY p.id, p.name
            ORDER BY units_sold DESC
            LIMIT 5
            """
        )
        top_products = cursor.fetchall()

        cursor.execute(
            """
            SELECT
                DATE(created_at) AS day,
                COUNT(*) AS order_count,
                COALESCE(SUM(total), 0) AS revenue
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '30 days'
              AND status != 'Cancelled'
            GROUP BY DATE(created_at)
            ORDER BY day ASC
            """
        )
        daily_trend = cursor.fetchall()

        cursor.execute("SELECT COUNT(*) AS total_products FROM products")
        total_products = cursor.fetchone()["total_products"]

        cursor.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'user'")
        total_customers = cursor.fetchone()["total_customers"]

        return jsonify({
            "success": True,
            "summary": {
                "total_orders": summary["total_orders"],
                "total_revenue": float(summary["total_revenue"]),
                "avg_order_value": float(summary["avg_order_value"]),
                "total_products": total_products,
                "total_customers": total_customers
            },
            "status_counts": status_counts,
            "top_products": [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "units_sold": row["units_sold"],
                    "revenue": float(row["revenue"])
                }
                for row in top_products
            ],
            "daily_trend": [
                {
                    "day": row["day"].isoformat(),
                    "order_count": row["order_count"],
                    "revenue": float(row["revenue"])
                }
                for row in daily_trend
            ]
        })
    except Exception as exc:
        print("Admin analytics error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@order_bp.route("/update-order-status/<int:order_id>", methods=["PUT"])
@admin_required
def update_order(order_id):
    # Previously unauthenticated — anyone could change any order's status.
    data = request.json or {}
    status = data.get("status")

    if status not in VALID_STATUSES:
        return jsonify({
            "success": False,
            "message": f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}"
        }), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE orders SET status=%s WHERE id=%s",
            (status, order_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Order not found."}), 404

        return jsonify({"success": True, "message": "Status updated."})
    except Exception as exc:
        print("Update order error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
