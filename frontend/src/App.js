import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AdminRoute from "./components/AdminRoute";

// Kept eager: small, and on the critical path most visitors actually take
// (browsing, auth, checkout).
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Lazy-loaded: ProductDetail pulls in Swiper (a sizeable dependency), and
// the admin pages are only ever visited by admins -- neither needs to be
// in the bundle every regular shopper downloads on their first visit.
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));

function RouteFallback() {
  return <div className="route-loading" aria-busy="true" />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <ScrollToTop />

        <Navbar />

        <div className="app-content">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
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
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
