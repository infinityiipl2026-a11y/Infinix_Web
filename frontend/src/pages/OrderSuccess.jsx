import { Link, useParams } from "react-router-dom";

const OrderSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className="container section" style={{ textAlign: "center" }}>
      <h1 className="page-title">Order Placed Successfully!</h1>

      {orderId && (
        <p>
          Your order number is <strong>{orderId}</strong>.
        </p>
      )}

      <p>
        Thank you for shopping with Infinix. We&apos;ll send updates on your
        order status, and you can track it anytime from your account.
      </p>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link to="/dashboard" className="btn">
          View My Orders
        </Link>
        <Link to="/shop" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
