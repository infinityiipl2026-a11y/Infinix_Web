import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";

const STATUS_COLORS = {
  Pending: "#b58900",
  Confirmed: "#268bd2",
  Packed: "#6c71c4",
  Shipped: "#2aa198",
  Delivered: "#2e7d32",
  Cancelled: "#c0392b",
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await getMyOrders(user.id);

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setMessage(data.message || "Unable to load your orders.");
        }
      } catch (error) {
        console.error("Load orders error:", error);
        setMessage("Server error while loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container section">
      <h1 className="page-title">My Account</h1>

      <div className="dashboard-profile">
        <p>
          <strong>Name:</strong> {user.fullname}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <h2 className="page-title" style={{ marginTop: "2rem" }}>
        Order History
      </h2>

      {loading ? (
        <p>Loading your orders...</p>
      ) : message ? (
        <p style={{ color: "red" }}>{message}</p>
      ) : orders.length === 0 ? (
        <p>
          You haven't placed any orders yet.{" "}
          <Link to="/shop" className="auth-link">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span>
                  <strong>
                    Order{" "}
                    {`ORD-${new Date(order.created_at).getFullYear()}-${String(
                      order.id
                    ).padStart(6, "0")}`}
                  </strong>
                </span>

                <span
                  style={{
                    color: STATUS_COLORS[order.status] || "#555",
                    fontWeight: 600,
                  }}
                >
                  {order.status || "Pending"}
                </span>
              </div>

              <p>
                <strong>Placed:</strong>{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>

              <p>
                <strong>Total:</strong> ₹
                {Number(order.total).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>

              <p>
                <strong>Delivering to:</strong>
                <br />
                {order.city}, {order.state}
              </p>

              <p>
                <strong>Payment:</strong> {order.payment_method}
              </p>

              {order.items && order.items.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <strong>Items:</strong>

                  <ul
                    style={{
                      marginTop: "0.5rem",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;