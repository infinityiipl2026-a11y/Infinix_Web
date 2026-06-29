import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/api";

const Checkout = () => {

  const {
    cartItems,
    cartTotal,
    clearCart
  } = useCart();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({

    full_name: user?.fullname || "",

    email: user?.email || "",

    phone: "",

    address: "",

    city: "",

    state: "",

    pincode: "",

    payment_method: "Cash On Delivery"

  });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

const handleOrder = async () => {

  if (!user) {
    alert("Please login first.");
    navigate("/login");
    return;
  }

  // Full Name
  if (!/^[A-Za-z ]{3,60}$/.test(formData.full_name.trim())) {
    alert("Please enter a valid full name.");
    return;
  }

  // Email
  if (
    !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      formData.email.trim()
    )
  ) {
    alert("Please enter a valid email address.");
    return;
  }

  // Phone Number
  if (!/^[6-9][0-9]{9}$/.test(formData.phone.trim())) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  // Address
  if (formData.address.trim().length < 15) {
    alert("Address should be at least 15 characters.");
    return;
  }

  // City
  if (!/^[A-Za-z ]+$/.test(formData.city.trim())) {
    alert("Please enter a valid city.");
    return;
  }

  // State
  if (!/^[A-Za-z ]+$/.test(formData.state.trim())) {
    alert("Please enter a valid state.");
    return;
  }

  // Pincode
  if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
    alert("Please enter a valid 6-digit pincode.");
    return;
  }

  try {

    const response = await placeOrder({
      user_id: user.id,
      ...formData
    });

    if (response.success) {

      await clearCart();

      alert("Order Placed Successfully!");

      navigate(`/order-success/${response.order_id}`);

    } else {

      alert(response.message);

    }

  } catch (error) {

    console.error(error);

    alert("Server Error");

  }

};

  return (

    <div className="container section">

      <h1 className="page-title">
        Checkout
      </h1>

      <div className="checkout-layout">

        {/* CUSTOMER DETAILS */}

        <div className="checkout-form">

<input
    type="text"
    name="full_name"
    placeholder="Full Name"
    value={formData.full_name}
    onChange={handleChange}
    required
    minLength={3}
    maxLength={60}
    pattern="^[A-Za-z ]+$"
    title="Only alphabets are allowed"
/>

<input
    type="email"
    name="email"
    placeholder="Email Address"
    value={formData.email}
    onChange={handleChange}
    required
/>

<input
    type="tel"
    name="phone"
    placeholder="Phone Number"
    value={formData.phone}
    onChange={handleChange}
    required
    pattern="[6-9]{1}[0-9]{9}"
    maxLength={10}
    title="Enter a valid 10-digit Indian mobile number"
/>

<textarea
    name="address"
    rows="4"
    placeholder="House No, Building, Street..."
    value={formData.address}
    onChange={handleChange}
    required
    minLength={15}
/>
<input
    type="text"
    name="city"
    placeholder="City"
    value={formData.city}
    onChange={handleChange}
    required
    pattern="^[A-Za-z ]+$"
/>

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />

<input
    type="text"
    name="pincode"
    placeholder="Pincode"
    value={formData.pincode}
    onChange={handleChange}
    required
    pattern="[1-9][0-9]{5}"
    maxLength={6}
    title="Enter a valid 6-digit pincode"
/>

<select
name="payment_method"
value={formData.payment_method}
onChange={handleChange}
required
>

<option value="">
Choose Payment Method
</option>

<option value="UPI">
UPI
</option>

<option value="Credit / Debit Card">
Credit / Debit Card
</option>

</select>

        </div>

        {/* ORDER SUMMARY */}

        <div className="checkout-summary">

          <h2>
            Order Summary
          </h2>

          {cartItems.length === 0 ? (

            <p>Your cart is empty.</p>

          ) : (

            cartItems.map((item) => (

              <div
                key={item.id}
                className="summary-item"
              >

                <span>

                  {item.name}

                  {" "}

                  ×

                  {" "}

                  {item.quantity}

                </span>

                <span>

                  ₹{(item.price * item.quantity).toFixed(2)}

                </span>

              </div>

            ))

          )}

          <hr />

          <h3>

            Total :

            {" "}

            ₹{cartTotal.toFixed(2)}

          </h3>

          <button
            className="btn"
            onClick={handleOrder}
            disabled={cartItems.length === 0}
          >
            Place Order
          </button>

        </div>

      </div>

    </div>

  );

};

export default Checkout;