import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminRoute from "./components/AdminRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <ScrollToTop />

        <Navbar />

        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route
              path="/product/:id"
              element={<ProductDetail />}
            />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={<Checkout />}
            />
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/admin"
              element={<AdminRoute><AdminDashboard /></AdminRoute>}
            />
            <Route
              path="/add-product"
              element={<AdminRoute><AddProduct /></AdminRoute>}
            />
            <Route
              path="/edit-product/:id"
              element={<AdminRoute><EditProduct /></AdminRoute>}
            />
            <Route
              path="/about"
              element={<About />}
            />
            <Route
              path="/contact"
              element={<Contact />}
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;