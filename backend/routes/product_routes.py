from functools import wraps
from flask import Blueprint, request, jsonify

from config.mysql import get_db

import os
import uuid

from werkzeug.utils import secure_filename

product_bp = Blueprint(
    "products",
    __name__
)


def admin_required(fn):

    @wraps(fn)
    def wrapper(*args, **kwargs):

        user_role = request.headers.get(
            "X-User-Role",
            ""
        )

        if user_role != "admin":

            return jsonify({
                "success": False,
                "message": "Admin access required."
            }), 403

        return fn(*args, **kwargs)

    return wrapper


@product_bp.route(
    "/products",
    methods=["GET"]
)
def get_products():

    try:

        conn = get_db()

        cursor = conn.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT *
            FROM products
            ORDER BY id DESC
            """
        )

        products = cursor.fetchall()

        return jsonify(products)

    except Exception as exc:

        print(
            "Get products error:",
            exc
        )

        return jsonify({
            "success": False,
            "message": "Server error."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


@product_bp.route(
    "/product/<int:product_id>",
    methods=["GET"]
)
def get_product(product_id):

    try:

        conn = get_db()

        cursor = conn.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT *
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:

            return jsonify({
                "success": False,
                "message": "Product not found."
            }), 404

        return jsonify(product)

    except Exception as exc:

        print(
            "Get product error:",
            exc
        )

        return jsonify({
            "success": False,
            "message": "Server error."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


@product_bp.route(
    "/add-product",
    methods=["POST"]
)
@admin_required
def add_product():

    conn = None
    cursor = None

    try:

        image = request.files.get(
            "image"
        )

        if not image:

            return jsonify({
                "success": False,
                "message": "Image is required."
            }), 400

        filename = (
            str(uuid.uuid4())
            + "_"
            + secure_filename(
                image.filename
            )
        )

        upload_folder = "uploads"

        os.makedirs(
            upload_folder,
            exist_ok=True
        )

        image.save(
            os.path.join(
                upload_folder,
                filename
            )
        )

        image_path = (
            f"/uploads/{filename}"
        )

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO products
            (
                family,
                name,
                category,
                variant,
                size,
                price,
                image,
                description,
                ingredients
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                request.form["family"],
                request.form["name"],
                request.form["category"],
                request.form["variant"],
                request.form["size"],
                float(
                    request.form["price"]
                ),
                image_path,
                request.form["description"],
                request.form["ingredients"]
            )
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message":
            "Product added successfully."
        })

    except Exception as exc:

        print(
            "Add product error:",
            exc
        )

        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


@product_bp.route(
    "/update-product/<int:product_id>",
    methods=["PUT"]
)
@admin_required
def update_product(product_id):

    data = request.json or {}

    allowed_fields = [
        "family",
        "name",
        "category",
        "variant",
        "size",
        "price",
        "image",
        "description",
        "ingredients"
    ]

    updates = []
    values = []

    for field in allowed_fields:

        if field in data:

            updates.append(
                f"{field} = %s"
            )

            values.append(
                data[field]
            )

    if not updates:

        return jsonify({
            "success": False,
            "message":
            "At least one field is required."
        }), 400

    try:

        conn = get_db()

        cursor = conn.cursor()

        values.append(product_id)

        query = (
            f"UPDATE products SET "
            f"{', '.join(updates)} "
            f"WHERE id = %s"
        )

        cursor.execute(
            query,
            tuple(values)
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message":
            "Product updated successfully."
        })

    except Exception as exc:

        print(
            "Update product error:",
            exc
        )

        return jsonify({
            "success": False,
            "message": "Server error."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


@product_bp.route(
    "/delete-product/<int:product_id>",
    methods=["DELETE"]
)
@admin_required
def delete_product(product_id):

    try:

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message":
            "Product deleted successfully."
        })

    except Exception as exc:

        print(
            "Delete product error:",
            exc
        )

        return jsonify({
            "success": False,
            "message": "Server error."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()