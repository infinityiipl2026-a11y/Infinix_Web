import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../services/api";
import AdminNav from "../components/AdminNav";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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
{/* DAILY TREND */}
<div
  style={{
    marginTop: "2rem",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}
>
  <h3 style={{ marginBottom: "1rem" }}>
    Orders & Revenue — Last 30 Days
  </h3>

  {data.daily_trend.length === 0 ? (
    <p>No orders in the last 30 days.</p>
  ) : (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={data.daily_trend}
        margin={{
          top: 20,
          right: 30,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="day"
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })
          }
        />

        <YAxis
          yAxisId="left"
          allowDecimals={false}
          label={{
            value: "Orders",
            angle: -90,
            position: "insideLeft",
          }}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `₹${value}`}
          label={{
            value: "Revenue",
            angle: 90,
            position: "insideRight",
          }}
        />

        <Tooltip
          labelFormatter={(date) =>
            new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          }
          formatter={(value, name) => {
            if (name === "Revenue") {
              return [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Revenue",
              ];
            }

            return [value, "Orders"];
          }}
        />

        <Legend />

        <Bar
          yAxisId="left"
          dataKey="order_count"
          name="Orders"
          fill="#5A2C76"
          radius={[6, 6, 0, 0]}
        />

        <Bar
          yAxisId="right"
          dataKey="revenue"
          name="Revenue"
          fill="#2AA198"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )}

  <p
    style={{
      marginTop: "1rem",
      color: "#777",
      textAlign: "center",
      fontSize: "0.9rem",
    }}
  >
    Purple bars represent daily orders and green bars represent daily revenue.
  </p>
</div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
