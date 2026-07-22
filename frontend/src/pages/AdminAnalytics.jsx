import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../services/api";
import AdminNav from "../components/AdminNav";

const STATUS_COLORS = {
  Pending: "#b58900",
  Confirmed: "#268bd2",
  Packed: "#6c71c4",
  Shipped: "#2aa198",
  Delivered: "#2e7d32",
  Cancelled: "#c0392b"
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: "10px",
      padding: "1.25rem",
      flex: "1 1 180px"
    }}
  >
    <p style={{ margin: 0, color: "#777", fontSize: "0.9rem" }}>{label}</p>
    <h2 style={{ margin: "0.25rem 0 0" }}>{value}</h2>
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getAdminAnalytics();
        if (result.success) {
          setData(result);
        } else {
          setMessage(result.message || "Unable to load analytics.");
        }
      } catch (error) {
        console.error("Load analytics error:", error);
        setMessage("Server error while loading analytics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="container section">
      <h1>Admin Dashboard</h1>
      <AdminNav />

      <h2 style={{ margin: "1.5rem 0 1rem" }}>Store Analytics</h2>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {loading ? (
        <p>Loading analytics...</p>
      ) : !data ? null : (
        <>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <StatCard label="Total Orders" value={data.summary.total_orders} />
            <StatCard
              label="Total Revenue"
              value={`₹${Number(data.summary.total_revenue).toLocaleString("en-IN", {
                maximumFractionDigits: 2
              })}`}
            />
            <StatCard
              label="Avg Order Value"
              value={`₹${Number(data.summary.avg_order_value).toFixed(2)}`}
            />
            <StatCard label="Products Listed" value={data.summary.total_products} />
            <StatCard label="Registered Customers" value={data.summary.total_customers} />
          </div>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {/* ORDERS BY STATUS */}
            <div style={{ flex: "1 1 300px" }}>
              <h3>Orders By Status</h3>
              {Object.keys(data.status_counts).length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <div>
                  {Object.entries(data.status_counts).map(([status, count]) => {
                    const total = Object.values(data.status_counts).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status} style={{ marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <span style={{ color: STATUS_COLORS[status] || "#555", fontWeight: 600 }}>
                            {status}
                          </span>
                          <span>{count}</span>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "10px" }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              background: STATUS_COLORS[status] || "#999",
                              height: "100%",
                              borderRadius: "6px"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TOP PRODUCTS */}
            <div style={{ flex: "1 1 300px" }}>
              <h3>Top Selling Products</h3>
              {data.top_products.length === 0 ? (
                <p>No sales yet.</p>
              ) : (
                <ol style={{ paddingLeft: "1.25rem" }}>
                  {data.top_products.map((product) => (
                    <li key={product.id} style={{ marginBottom: "0.5rem" }}>
                      <strong>{product.name}</strong> — {product.units_sold} units sold
                      {" "}(₹{Number(product.revenue).toFixed(2)})
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* DAILY TREND */}
          <div style={{ marginTop: "2rem" }}>
            <h3>Orders — Last 30 Days</h3>
            {data.daily_trend.length === 0 ? (
              <p>No orders in the last 30 days.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "4px",
                  height: "160px",
                  borderBottom: "1px solid #ddd",
                  padding: "0 0.5rem"
                }}
              >
                {data.daily_trend.map((day) => {
                  const maxCount = Math.max(...data.daily_trend.map((d) => d.order_count), 1);
                  const heightPct = (day.order_count / maxCount) * 100;
                  return (
                    <div
                      key={day.day}
                      title={`${day.day}: ${day.order_count} orders, ₹${Number(day.revenue).toFixed(2)}`}
                      style={{
                        flex: 1,
                        minWidth: "6px",
                        height: `${Math.max(heightPct, 4)}%`,
                        background: "#6c71c4",
                        borderRadius: "3px 3px 0 0"
                      }}
                    />
                  );
                })}
              </div>
            )}
            <p style={{ color: "#777", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Hover a bar to see that day&apos;s order count and revenue.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
