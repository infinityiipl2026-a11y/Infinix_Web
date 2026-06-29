const Contact = () => {
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

          <form className="contact-form">

            <input
              type="text"
              placeholder="Your Name"
            />

            <input
              type="email"
              placeholder="Email Address"
            />

            <input
              type="text"
              placeholder="Subject"
            />

            <textarea
              rows="6"
              placeholder="Your Message"
            />

            <button
              type="submit"
              className="btn"
            >
              Send Message
            </button>

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
