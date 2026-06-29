import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaTimes
} from "react-icons/fa";

const Navbar = () => {
  
  const { cartItems } = useCart();

const cartCount = cartItems.reduce(
  (total, item) =>
    total + item.quantity,
  0
);

  const [showSearch, setShowSearch] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);
  
  const [showAuthModal, setShowAuthModal] =
    useState(false);

  const [searchTerm, setSearchTerm] =
  useState("");

  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      // Preserve cart items in MySQL for this user on logout.
    } catch (error) {
      console.log(error);
    }

    setUser(null);
    localStorage.removeItem("cart");
    localStorage.removeItem("user");
    window.location.reload();
  };

const handleSearch = () => {

  if (!searchTerm.trim()) return;

  navigate(
    `/shop?search=${encodeURIComponent(
      searchTerm
    )}`
  );

  setShowSearch(false);

};

  return (

    <nav className="navbar">

      <div className="container navbar-container">

        <button
          className="mobile-menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          {menuOpen
            ? <FaTimes />
            : <FaBars />}
        </button>

        <div className="logo-left">

          <img
            src="/images/logo1.png"
            alt="Logo"
            className="nav-logo"
          />

        </div>

        <ul className="nav-menu">

          <li>
            <Link to="/">
              Home
            </Link>
          </li>

          <li>
            <Link to="/shop">
              Shop
            </Link>
          </li>

          <li>
            <Link to="/about">
              About
            </Link>
          </li>

          <li>
            <Link to="/contact">
              Contact
            </Link>
          </li>

        </ul>

        <div className="nav-icons">

          <button
            className="icon-btn"
            onClick={() =>
              setShowSearch(
                !showSearch
              )
            }
          >
            <FaSearch />
          </button>

          <button
            className="icon-btn"
            onClick={() =>
              setShowAuthModal(true)
            }
          >
            <FaUser />

            {user && (
              <span
                className="logged-user-name"
              >
                {user.fullname}
              </span>
            )}

          </button>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="admin-link desktop-admin"
            >
              Admin
            </Link>
          )}

          <Link
            to="/cart"
            className="cart-icon-wrapper"
          >

            <FaShoppingCart />

            {cartCount > 0 && (

              <span className="cart-badge">
                {cartCount}
              </span>

            )}

          </Link>
        </div>

        <div className="logo-right">

          <img
            src="/images/logo2.png"
            alt="Logo"
            className="nav-logo"
          />

        </div>

      </div>

{showSearch && (

  <div className="search-bar-container">

    <input
      type="text"
      placeholder="Search products..."
      className="navbar-search"
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(
          e.target.value
        )
      }
      onKeyDown={(e) => {

        if (e.key === "Enter") {

          handleSearch();

        }

      }}
    />

    <button
      className="search-btn"
      onClick={handleSearch}
    >
      Search
    </button>

  </div>

)}

        {menuOpen && (

          <div className="mobile-menu">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>

            {user?.role === "admin" && (

              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>

            )}

          </div>

        )}

      {showAuthModal && (

        <div
          className="auth-modal-overlay"
          onClick={() =>
            setShowAuthModal(false)
          }
        >

          <div
            className="auth-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-modal"
              onClick={() =>
                setShowAuthModal(false)
              }
            >
              ✕
            </button>

            {user ? (

              <>

                <h2>
                  Welcome
                </h2>

                <h3>
                  {user.fullname}
                </h3>

                <p>
                  {user.email}
                </p>

                <button
                  className="btn"
                  onClick={
                    handleLogout
                  }
                >
                  Logout
                </button>

              </>

            ) : (

              <>

                <h2>
                  Welcome
                </h2>

                <p>
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="btn"
                  onClick={() =>
                    setShowAuthModal(false)
                  }
                >
                  Login
                </Link>

                <p
                  style={{
                    marginTop: "20px"
                  }}
                >
                  New Customer?
                </p>

                <Link
                  to="/register"
                  className="btn"
                  onClick={() =>
                    setShowAuthModal(false)
                  }
                >
                  Register
                </Link>

              </>

            )}

          </div>

        </div>

      )}

    </nav>

  );

};

export default Navbar;