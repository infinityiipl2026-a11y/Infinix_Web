import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../services/api";
import AdminNav from "../components/AdminNav";

const ALL_STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS = {
  Pending: "#b58900",
  Confirmed: "#268bd2",
  Packed: "#6c71c4",
  Shipped: "#2aa198",
  Delivered: "#2e7d32",
  Cancelled: "#c0392b"
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setMessage(data.message || "Unable to load orders.");
      }
    } catch (error) {
      console.error("Load orders error:", error);
      setMessage("Server error while loading orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const data = await updateOrderStatus(orderId, newStatus);
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        setMessage(data.message || "Unable to update order status.");
      }
    } catch (error) {
      console.error("Update order status error:", error);
      setMessage("Server error while updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((order) => (order.status || "Pending") === statusFilter);

  return (
    <div className="container section">
      <h1>Admin Dashboard</h1>
      <AdminNav />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          margin: "1.5rem 0"
        }}
      >
        <h2 style={{ margin: 0 }}>All Customer Orders</h2>

        <select
          className="filter-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {loading ? (
        <p>Loading orders...</p>
      ) : visibleOrders.length === 0 ? (
        <p>No orders found{statusFilter !== "All" ? ` with status "${statusFilter}"` : ""}.</p>
      ) : (
        <div className="admin-orders-list">
          {visibleOrders.map((order) => {
            const status = order.status || "Pending";
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="order-card"
                style={{ marginBottom: "1rem" }}
              >
                <div
                  className="order-card-header"
                  style={{ cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <span>
                  <strong>
                    Order {`ORD-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(6, "0")}`}
                  </strong>
                    {" — "}
                    {order.full_name} ({order.email})
                  </span>
                  <span style={{ color: STATUS_COLORS[status] || "#555", fontWeight: 600 }}>
                    {status}
                  </span>
                </div>

                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Placed:</strong>{" "}
                  {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
                  {"  •  "}
                  <strong>Total:</strong> ₹{Number(order.total).toFixed(2)}
                  {"  •  "}
                  <strong>Payment:</strong> {order.payment_method}
                </p>

                {isExpanded && (
                  <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #eee" }}>
                    <p>
                      <strong>Contact:</strong> {order.phone}
                    </p>
                    <p>
                      <strong>Delivering to:</strong> {order.address}, {order.city},{" "}
                      {order.state} - {order.pincode}
                    </p>

                    {order.items && order.items.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <strong>Items:</strong>
                        <ul style={{ marginTop: "0.25rem" }}>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              {item.product_name} × {item.quantity} — ₹{Number(item.price).toFixed(2)} each
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label htmlFor={`status-${order.id}`} style={{ fontWeight: 600 }}>
                    Update Status:
                  </label>
                  <select
                    id={`status-${order.id}`}
                    className="filter-input"
                    value={status}
                    disabled={updatingId === order.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {updatingId === order.id && <span>Saving...</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
