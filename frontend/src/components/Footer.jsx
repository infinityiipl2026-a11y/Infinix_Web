import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP
} from "react-icons/fa";

import {
  Link
} from "react-router-dom";

const Footer = () => {

  return (

    <footer className="footer">

      <div className="container footer-grid">

        {/* COMPANY */}

        <div>

          <h3>
            Infinix
          </h3>

          <p>

            Delivering quality
            household, hygiene,
            cosmetic and perfume
            products across India.

          </p>

        </div>

        {/* QUICK LINKS */}

        <div>

          <h4>
            Quick Links
          </h4>

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/contact">
            Contact
          </Link>

        </div>

        {/* CATEGORIES */}

        <div>

          <h4>
            Categories
          </h4>

          <Link to="/shop?category=Perfumes">
            Perfumes
          </Link>

          <Link to="/shop?category=Cosmetics">
            Cosmetics
          </Link>

          <Link to="/shop?category=Household">
            Household
          </Link>

          <Link to="/shop?category=Soap">
            Soap
          </Link>

        </div>

        {/* CONTACT */}

        <div>

          <h4>
            Contact Us
          </h4>

          <p>
            🌐 www.infinitycpd.in
          </p>

          <p>
            ✉ info@infinitycpd.in
          </p>

<div className="footer-social">

  <a
    href="https://www.facebook.com/infinitycpd.in/"
    target="_blank"
    rel="noreferrer"
    title="Facebook"
  >
    <FaFacebookF />
  </a>

  <a
    href="https://www.instagram.com/infinitycpd/"
    target="_blank"
    rel="noreferrer"
    title="Instagram"
  >
    <FaInstagram />
  </a>

  <a
    href="https://pin.it/tperhrupkmjhqb"
    target="_blank"
    rel="noreferrer"
    title="Pinterest"
  >
    <FaPinterestP />
  </a>

</div>

        </div>

      </div>

      <div className="footer-bottom">

        © {new Date().getFullYear()}
        {" "}
        Infinix. All Rights Reserved.

      </div>

    </footer>

  );

};

export default Footer;