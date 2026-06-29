from flask import Blueprint, request, jsonify

from config.mysql import get_db

cart_bp = Blueprint("cart", __name__)


def format_cart_item(record):
    return {
        "id": record["id"],
        "user_id": record.get("user_id"),
        "product_id": record.get("product_id"),
        "quantity": record.get("quantity"),
        "name": record.get("name"),
        "price": record.get("price"),
        "image": record.get("image")
    }


@cart_bp.route("/add-cart", methods=["POST"])
def add_cart():
    data = request.json or {}
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not user_id or not product_id:
        return jsonify({"success": False, "message": "Missing cart fields."}), 400

    try:
        quantity = int(quantity)
        if quantity < 1:
            quantity = 1
    except (TypeError, ValueError):
        quantity = 1

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, quantity FROM cart WHERE user_id = %s AND product_id = %s",
            (user_id, product_id)
        )
        existing_item = cursor.fetchone()

        if existing_item:
            new_quantity = existing_item["quantity"] + quantity
            cursor.execute(
                "UPDATE cart SET quantity = %s WHERE id = %s",
                (new_quantity, existing_item["id"])
            )
            cart_item_id = existing_item["id"]
        else:
            cursor.execute(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
                (user_id, product_id, quantity)
            )
            cart_item_id = cursor.lastrowid

        conn.commit()
        cursor.execute(
            "SELECT c.id, c.user_id, c.product_id, c.quantity, p.name, p.price, p.image "
            "FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = %s",
            (cart_item_id,)
        )
        cart_item = cursor.fetchone()

        return jsonify({"success": True, "cart_item": format_cart_item(cart_item)})
    except Exception as exc:
        print("Add cart error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@cart_bp.route("/cart/<int:user_id>", methods=["GET"])
def get_cart(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT c.id, c.user_id, c.product_id, c.quantity, p.name, p.price, p.image "
            "FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = %s",
            (user_id,)
        )
        cart_items = cursor.fetchall()
        formatted_items = [format_cart_item(item) for item in cart_items]
        return jsonify(formatted_items)
    except Exception as exc:
        print("Get cart error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@cart_bp.route("/cart/<int:item_id>", methods=["PUT"])
def update_cart_item(item_id):
    data = request.json or {}
    quantity = data.get("quantity")

    if quantity is None:
        return jsonify({"success": False, "message": "Missing quantity."}), 400

    try:
        quantity = int(quantity)
        if quantity < 1:
            quantity = 1
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Invalid quantity."}), 400

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "UPDATE cart SET quantity = %s WHERE id = %s",
            (quantity, item_id)
        )
        conn.commit()

        cursor.execute(
            "SELECT c.id, c.user_id, c.product_id, c.quantity, p.name, p.price, p.image "
            "FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = %s",
            (item_id,)
        )
        cart_item = cursor.fetchone()

        if not cart_item:
            return jsonify({"success": False, "message": "Cart item not found."}), 404

        return jsonify({"success": True, "cart_item": format_cart_item(cart_item)})
    except Exception as exc:
        print("Update cart error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@cart_bp.route("/cart/<int:item_id>", methods=["DELETE"])
def remove_cart(item_id):
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cart WHERE id = %s", (item_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Cart item removed."})
    except Exception as exc:
        print("Remove cart error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@cart_bp.route("/clear-cart/<int:user_id>", methods=["DELETE"])
def clear_cart(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cart WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Cart cleared."})
    except Exception as exc:
        print("Clear cart error:", exc)
        return jsonify({"success": False, "message": "Server error."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()