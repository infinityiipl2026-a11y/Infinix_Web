from flask import Blueprint, request, jsonify

from config.mysql import get_db

order_bp = Blueprint("orders", __name__)


@order_bp.route("/place-order", methods=["POST"])
def place_order():

    data = request.json or {}

    required_fields = [

        "user_id",

        "full_name",

        "email",

        "phone",

        "address",

        "city",

        "state",

        "pincode",

        "payment_method"

    ]

    for field in required_fields:

        if not data.get(field):

            return jsonify({

                "success": False,

                "message": f"{field} is required."

            }), 400

    conn = None
    cursor = None

    try:

        conn = get_db()

        cursor = conn.cursor(dictionary=True)

        cursor.execute(

            """
            SELECT
                c.product_id,
                c.quantity,
                p.price
            FROM cart c
            JOIN products p
            ON c.product_id = p.id
            WHERE c.user_id = %s
            """,

            (data["user_id"],)

        )

        cart_items = cursor.fetchall()

        if len(cart_items) == 0:

            return jsonify({

                "success": False,

                "message": "Cart is empty."

            }), 400

        total = 0

        for item in cart_items:

            total += item["price"] * item["quantity"]

        cursor.execute(

            """
            INSERT INTO orders
            (
                user_id,
                full_name,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                payment_method,
                total
            )
            VALUES
            (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            """,

            (

                data["user_id"],

                data["full_name"],

                data["email"],

                data["phone"],

                data["address"],

                data["city"],

                data["state"],

                data["pincode"],

                data["payment_method"],

                total

            )

        )

        order_id = cursor.lastrowid

        for item in cart_items:

            cursor.execute(

                """
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES
                (
                    %s,%s,%s,%s
                )
                """,

                (

                    order_id,

                    item["product_id"],

                    item["quantity"],

                    item["price"]

                )

            )

        cursor.execute(

            """
            DELETE FROM cart
            WHERE user_id=%s
            """,

            (data["user_id"],)

        )

        conn.commit()

        return jsonify({

            "success": True,

            "message": "Order placed successfully.",

            "order_id": order_id

        })

    except Exception as e:

        print(e)

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


@order_bp.route("/my-orders/<int:user_id>", methods=["GET"])
def my_orders(user_id):

    conn = get_db()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(

        """
        SELECT *
        FROM orders
        WHERE user_id=%s
        ORDER BY created_at DESC
        """,

        (user_id,)

    )

    orders = cursor.fetchall()

    cursor.close()

    conn.close()

    return jsonify({

        "success": True,

        "orders": orders

    })


@order_bp.route("/orders", methods=["GET"])
def all_orders():

    conn = get_db()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(

        """
        SELECT *
        FROM orders
        ORDER BY created_at DESC
        """

    )

    orders = cursor.fetchall()

    cursor.close()

    conn.close()

    return jsonify({

        "success": True,

        "orders": orders

    })


@order_bp.route("/update-order-status/<int:order_id>", methods=["PUT"])
def update_order(order_id):

    data = request.json

    status = data.get("status")

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute(

        """
        UPDATE orders
        SET status=%s
        WHERE id=%s
        """,

        (status, order_id)

    )

    conn.commit()

    cursor.close()

    conn.close()

    return jsonify({

        "success": True,

        "message": "Status updated."

    })