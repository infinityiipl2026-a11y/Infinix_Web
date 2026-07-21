import re
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr

from flask import Blueprint, request, jsonify

from config import settings
from extensions import limiter

contact_bp = Blueprint("contact", __name__)

NAME_RE = re.compile(r"^[A-Za-z\s]{2,50}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

NAME_MIN, NAME_MAX = 2, 50
SUBJECT_MIN, SUBJECT_MAX = 5, 100
MESSAGE_MIN, MESSAGE_MAX = 10, 1000


def validate_contact_payload(data):
    """
    Validates the contact form payload. Returns a dict of field -> error
    message for every field that fails validation (empty dict = valid).
    """
    errors = {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not name:
        errors["name"] = "Name is required."
    elif not NAME_RE.match(name):
        errors["name"] = (
            f"Name must be {NAME_MIN}-{NAME_MAX} characters and contain "
            "only letters and spaces."
        )

    if not email:
        errors["email"] = "Email is required."
    elif not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."

    if not subject:
        errors["subject"] = "Subject is required."
    elif not (SUBJECT_MIN <= len(subject) <= SUBJECT_MAX):
        errors["subject"] = f"Subject must be {SUBJECT_MIN}-{SUBJECT_MAX} characters."

    if not message:
        errors["message"] = "Message is required."
    elif not (MESSAGE_MIN <= len(message) <= MESSAGE_MAX):
        errors["message"] = f"Message must be {MESSAGE_MIN}-{MESSAGE_MAX} characters."

    return errors, {"name": name, "email": email, "subject": subject, "message": message}


def send_contact_email(payload):
    """
    Sends the contact form submission to CONTACT_RECEIVER_EMAIL via SMTP.
    Raises on failure so the caller can translate it into an HTTP error.
    """
    body = (
        f"New contact form submission\n\n"
        f"Name: {payload['name']}\n"
        f"Email: {payload['email']}\n"
        f"Subject: {payload['subject']}\n\n"
        f"Message:\n{payload['message']}\n"
    )

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = f"[Contact Form] {payload['subject']}"
    msg["From"] = formataddr(("Infinity CPD Website", settings.SMTP_FROM_EMAIL))
    msg["To"] = settings.CONTACT_RECEIVER_EMAIL
    # Lets support hit "Reply" and respond directly to the sender.
    msg["Reply-To"] = payload["email"]

    # Port 465 is implicit TLS (connection is encrypted from the start);
    # other ports (587, 25, etc.) use STARTTLS to upgrade a plaintext
    # connection. Using the wrong one for a given port will hang or fail.
    if settings.SMTP_PORT == 465:
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
    else:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

    try:
        if settings.SMTP_PORT != 465:
            server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [settings.CONTACT_RECEIVER_EMAIL], msg.as_string())
    finally:
        server.quit()


@contact_bp.route("/contact", methods=["POST"])
@limiter.limit("5 per hour")
def contact():
    data = request.json or {}

    errors, payload = validate_contact_payload(data)
    if errors:
        return jsonify({
            "success": False,
            "message": "Please fix the highlighted fields.",
            "errors": errors,
        }), 400

    if not (settings.SMTP_USER and settings.SMTP_PASSWORD):
        print("Contact form error: SMTP_USER/SMTP_PASSWORD not configured.")
        return jsonify({
            "success": False,
            "message": "Email service is not configured. Please try again later.",
        }), 500

    try:
        send_contact_email(payload)
    except Exception as exc:
        print("Contact form send error:", exc)
        return jsonify({
            "success": False,
            "message": "We couldn't send your message right now. Please try again later.",
        }), 500

    return jsonify({
        "success": True,
        "message": "Thanks for reaching out! We'll get back to you soon.",
    })
