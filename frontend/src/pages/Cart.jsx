import { Link } from "react-router-dom";

import {
  useCart
} from "../context/CartContext";

const Cart = () => {

  const {

    cartItems,

    increaseQuantity,

    decreaseQuantity,

    removeItem,

    cartTotal

  } = useCart();

  return (

    <div className="container section">

      <h1 className="page-title">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (

<div className="empty-cart">

  <div className="empty-cart-icon">
    🛒
  </div>

  <h2>
    Your Cart Is Getting Lonely
  </h2>

  <p>
    Looks like you haven't added
    anything yet.
  </p>

  <p>
    Fill it up with amazing
    Infinix products!
  </p>

  <Link
    to="/shop"
    className="btn"
  >
    Start Shopping
  </Link>

</div>

      ) : (

        <>

          {cartItems.map((item) => (

            <div
              className="cart-item"
              key={item.id}
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-info">

                <h3>
                  {item.name}
                </h3>

                <p>
                  ₹{item.price}
                </p>

              </div>

              <div className="cart-qty">

                <button
                  onClick={() =>
                    decreaseQuantity(
                      item.id
                    )
                  }
                >
                  -
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity(
                      item.id
                    )
                  }
                >
                  +
                </button>

              </div>

              <button
                className="remove-btn"
                onClick={() =>
                  removeItem(item.id)
                }
              >
                Remove
              </button>

            </div>

          ))}

          <div className="cart-summary">

            <h2>

              Total :

              {" "}

              ₹{cartTotal}

            </h2>

            <div className="cart-buttons">

              <Link
                to="/shop"
                className="btn"
              >
                Continue Shopping
              </Link>

              <Link
                to="/checkout"
                className="btn"
              >
                Proceed To Checkout
              </Link>

            </div>

          </div>

        </>

      )}

    </div>

  );

};

export default Cart;