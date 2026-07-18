"""
JWT-based authentication/authorization helpers.

This replaces the previous approach used in the uploaded code, where
`admin_required` decorators trusted a client-supplied `X-User-Role` header:

    user_role = request.headers.get("X-User-Role", "")
    if user_role != "admin": ...

That is NOT authentication — any client can set any header on their own
request, so anyone could send `X-User-Role: admin` and get full admin
access to every product/order/admin endpoint. There was also no mechanism
tying a request to *which* user was making it, which is why cart/order
routes could be read or modified by passing an arbitrary user_id/item_id
in the URL (IDOR).

Instead, /login now issues a signed JWT containing the user's id/email/role.
The frontend must send it back on every authenticated request as:

    Authorization: Bearer <token>

`token_required` validates the token and attaches `request.current_user`.
`admin_required` additionally checks the role claim.
`owner_or_admin_required` checks that the authenticated user matches the
resource's owning user_id (or is an admin) — use this for cart/order
endpoints keyed by user_id.
"""
from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import jsonify, request

from config.settings import JWT_EXPIRY_HOURS, JWT_SECRET_KEY

JWT_ALGORITHM = "HS256"


def generate_token(user):
    """user: dict with at least id, email, role."""
    now = datetime.utcnow()
    payload = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _get_token_from_header():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _get_token_from_header()

        if not token:
            return jsonify({
                "success": False,
                "message": "Authentication required."
            }), 401

        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Session expired. Please log in again."
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "message": "Invalid authentication token."
            }), 401

        request.current_user = {
            "id": payload["user_id"],
            "email": payload["email"],
            "role": payload["role"],
        }
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    @token_required
    def wrapper(*args, **kwargs):
        if request.current_user["role"] != "admin":
            return jsonify({
                "success": False,
                "message": "Admin access required."
            }), 403
        return fn(*args, **kwargs)

    return wrapper


def owner_or_admin_required(get_owner_id):
    """
    Decorator factory for routes keyed by a resource owner's user_id.

    `get_owner_id(*args, **kwargs)` receives the same args/kwargs Flask
    passes to the route (e.g. the `user_id` captured from the URL) and
    must return the user_id that owns the resource being accessed.

    Usage:
        @cart_bp.route("/cart/<int:user_id>", methods=["GET"])
        @owner_or_admin_required(lambda user_id: user_id)
        def get_cart(user_id): ...
    """
    def decorator(fn):
        @wraps(fn)
        @token_required
        def wrapper(*args, **kwargs):
            owner_id = get_owner_id(*args, **kwargs)
            if (
                request.current_user["role"] != "admin"
                and request.current_user["id"] != owner_id
            ):
                return jsonify({
                    "success": False,
                    "message": "Access denied."
                }), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
