import { useState } from "react";

// Base URL of the Flask API. Configure via VITE_API_URL in your frontend
// .env (falls back to localhost for local development).
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const NAME_RE = /^[A-Za-z\s]{2,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validateField(name, value) {
  const trimmed = value.trim();

  switch (name) {
    case "name":
      if (!trimmed) return "Name is required.";
      if (!NAME_RE.test(trimmed)) {
        return "Name must be 2-50 characters and contain only letters and spaces.";
      }
      return "";

    case "email":
      if (!trimmed) return "Email is required.";
      if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address.";
      return "";

    case "subject":
      if (!trimmed) return "Subject is required.";
      if (trimmed.length < 5 || trimmed.length > 100) {
        return "Subject must be 5-100 characters.";
      }
      return "";

    case "message":
      if (!trimmed) return "Message is required.";
      if (trimmed.length < 10 || trimmed.length > 1000) {
        return "Message must be 10-1000 characters.";
      }
      return "";

    default:
      return "";
  }
}

function validateForm(form) {
  const errors = {};
  Object.keys(form).forEach((field) => {
    const error = validateField(field, form[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

const Contact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Re-validate this field as the user types once it's already been
    // flagged, so the inline error clears as soon as it's fixed.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("error");
      setStatusMessage("Please fix the highlighted fields.");
      return;
    }

    setStatus("sending");
    setStatusMessage("");

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        setStatus("error");
        setStatusMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setStatusMessage(data.message || "Thanks for reaching out! We'll get back to you soon.");
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (err) {
      setStatus("error");
      setStatusMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="container section">

      <h1 className="page-title">
        Contact Us
      </h1>

      <div className="contact-grid">

        {/* LEFT SIDE */}

        <div className="contact-info">

          <h2>Get In Touch</h2>

          <p>
            We'd love to hear from you. Reach out for
            product inquiries, business opportunities,
            franchise partnerships, or customer support.
          </p>

          <div className="contact-box">

            <h3>Email</h3>

            <p>
              <a href="mailto:info@einfinity.in">
                info@einfinity.in
              </a>
            </p>

            <p>
              <a href="mailto:sales@einfinity.in">
                sales@einfinity.in
              </a>
            </p>

          </div>

          <div className="contact-box">

            <h3>Telephone</h3>

            <p>
              <a href="tel:+912240462288">
                +91 22 4046 2288
              </a>
            </p>

            <p>
              <a href="tel:+912222672288">
                +91 22 2267 2288
              </a>
            </p>

          </div>

          <div className="contact-box">

            <h3>WhatsApp</h3>

            <a
              href="https://wa.me/919920542288"
              target="_blank"
              rel="noreferrer"
            >
              +91 99205 42288
            </a>

          </div>

          <div className="contact-box">

            <h3>Mumbai Office</h3>

            <p>
              1st Floor, Haroon House,
              294 Perin Nariman Street,
              Opp. RBI,
              Kala Ghoda, Fort,
              Mumbai - 400001
            </p>

          </div>

          <div className="contact-box">

            <h3>Delhi Branch</h3>

            <p>
              2nd Floor, 79 Shyam Lal Road,
              Daryaganj,
              New Delhi - 110002
            </p>

          </div>

          <div className="social-links">

            <h3>Follow Us</h3>

            <a
              href="https://www.instagram.com/infinitycpd/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            {" | "}

            <a
              href="https://www.facebook.com/infinitycpd.in/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>

            {" | "}

            <a
              href="https://pin.it/tperhrupkmjhqb"
              target="_blank"
              rel="noreferrer"
            >
              Pinterest
            </a>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={status === "sending"}
            />
            {errors.name && (
              <p className="field-error">{errors.name}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={status === "sending"}
            />
            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={status === "sending"}
            />
            {errors.subject && (
              <p className="field-error">{errors.subject}</p>
            )}

            <textarea
              rows="6"
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={status === "sending"}
            />
            {errors.message && (
              <p className="field-error">{errors.message}</p>
            )}

            <button
              type="submit"
              className="btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p className="form-success">{statusMessage}</p>
            )}

            {status === "error" && statusMessage && (
              <p className="form-error">{statusMessage}</p>
            )}

          </form>

          {/* MUMBAI MAP */}

          <div className="map-box">

            <h3>Mumbai Office</h3>

            <iframe
              title="Mumbai Office"
              src="https://maps.google.com/maps?q=Infinity%20Industries%20Pvt%20Ltd%20Fort%20Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
            />

          </div>

          {/* DELHI MAP */}

          <div
            className="map-box"
            style={{
              marginTop: "20px"
            }}
          >

            <h3>Delhi Branch</h3>

            <iframe
              title="Delhi Branch"
              src="https://maps.google.com/maps?q=INFINITY%20INDUSTRIES%20PVT%20LTD%20Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
            />

          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;
