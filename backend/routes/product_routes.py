from flask import Blueprint, request, jsonify

from config import settings
from config.db import get_db
from utils.auth import admin_required

import os
import uuid

from werkzeug.utils import secure_filename

product_bp = Blueprint(
    "products",
    __name__
)


def _allowed_image(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in settings.ALLOWED_IMAGE_EXTENSIONS
    )


@product_bp.route(
    "/products",
    methods=["GET"]
)
def get_products():

    conn = None
    cursor = None

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

    conn = None
    cursor = None

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

        if not image or not image.filename:

            return jsonify({
                "success": False,
                "message": "Image is required."
            }), 400

        if not _allowed_image(image.filename):

            return jsonify({
                "success": False,
                "message": (
                    "Unsupported image type. Allowed: "
                    + ", ".join(sorted(settings.ALLOWED_IMAGE_EXTENSIONS))
                )
            }), 400

        try:
            price = float(request.form["price"])
            if price < 0:
                raise ValueError("price must be non-negative")
        except (KeyError, ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Price must be a valid non-negative number."
            }), 400

        required_form_fields = [
            "family", "name", "category", "variant",
            "size", "description", "ingredients"
        ]
        missing = [f for f in required_form_fields if not request.form.get(f)]
        if missing:
            return jsonify({
                "success": False,
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400

        filename = (
            str(uuid.uuid4())
            + "_"
            + secure_filename(
                image.filename
            )
        )

        upload_folder = settings.UPLOAD_FOLDER

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
                price,
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
            "message": "Server error."
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

    conn = None
    cursor = None

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

    conn = None
    cursor = None

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