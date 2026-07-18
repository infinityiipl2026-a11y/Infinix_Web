import logging
import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import settings
from extensions import limiter
from models.db_init import initialize_database
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.cart_routes import cart_bp
from routes.order_routes import order_bp
from routes.product_routes import product_bp

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

app.config["SECRET_KEY"] = settings.SECRET_KEY
app.config["MAX_CONTENT_LENGTH"] = settings.MAX_CONTENT_LENGTH
app.config["UPLOAD_FOLDER"] = settings.UPLOAD_FOLDER
app.config["RATELIMIT_STORAGE_URI"] = settings.RATE_LIMIT_STORAGE_URI

# CORS: restricted to the origin(s) configured in CORS_ORIGINS. Never use
# origins="*" together with supports_credentials=True — browsers reject it,
# and it would defeat the purpose of restricting origins in the first place.
CORS(app, supports_credentials=True, origins=settings.CORS_ORIGINS)

limiter.init_app(app)

if not os.environ.get("VERCEL"):
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

# Schema bootstrap is opt-in outside local dev (see AUTO_CREATE_SCHEMA in
# config/settings.py) — running "CREATE TABLE IF NOT EXISTS" on every single
# app boot/worker start is not how production schema changes should happen.
if settings.AUTO_CREATE_SCHEMA:
    initialize_database()
else:
    logger.info(
        "AUTO_CREATE_SCHEMA is disabled; skipping automatic schema "
        "creation. Apply schema.sql manually against your database."
    )

app.register_blueprint(auth_bp)
app.register_blueprint(product_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(order_bp)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"success": False, "message": "Not found."}), 404


@app.errorhandler(413)
def payload_too_large(_error):
    return jsonify({"success": False, "message": "Uploaded file is too large."}), 413


@app.errorhandler(500)
def server_error(error):
    logger.exception("Unhandled server error: %s", error)
    return jsonify({"success": False, "message": "Internal server error."}), 500


if __name__ == "__main__":
    app.run(host=settings.HOST, port=settings.PORT, debug=settings.DEBUG)
