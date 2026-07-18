import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminDashboard, deleteProduct } from "../services/api";
import { resolveImageUrl } from "../config";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    try {
      const data = await adminDashboard();
      if (data.success) {
        setProducts(data.products);
      } else {
        setMessage(data.message || "Unable to fetch products.");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  return (
    <div className="container section">
      <h1>Admin Dashboard</h1>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <div className="admin-actions">
        <Link className="btn" to="/add-product">
          Add New Product
        </Link>
      </div>
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (
            <div className="admin-product-card" key={product.id}>
            <img
              src={resolveImageUrl(product.image)}
              alt={product.name}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "contain"
              }}
              onError={(e) => {
                console.log("Image failed:", product.image);
              }}
            />
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>₹{product.price}</p>
              <p>{product.variant}</p>
              <p>{product.size}</p>
              <div className="product-card-actions">
                <a className="btn" href={`/edit-product/${product.id}`}>
                  Edit
                </a>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (!window.confirm("Delete this product?")) return;
                    try {
                      const data = await deleteProduct(product.id);
                      if (data.success) {
                        setProducts(products.filter((item) => item.id !== product.id));
                      } else {
                        setMessage(data.message || "Delete failed.");
                      }
                    } catch (error) {
                      console.log(error);
                      setMessage("Server error.");
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
