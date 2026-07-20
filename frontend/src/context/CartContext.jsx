import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearUserCart
} from "../services/api";

const CartContext = createContext();

const formatCartItem = (item) => ({
  id: item.id,
  user_id: item.user_id,
  product_id: item.product_id ?? item.id,
  name: item.name,
  price: item.price,
  image: item.image,
  quantity: item.quantity
});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const response = await getCart(user.id);
          const items = Array.isArray(response)
            ? response
            : response?.cart_items || [];

          setCartItems(items.map(formatCartItem));
        } catch (error) {
          console.error("Load cart error:", error);
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      }
    };

    loadCart();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (user) {
      try {
        const response = await addCartItem({
          user_id: user.id,
          product_id: product.id,
          quantity
        });

        if (response.success) {
          const cartItem = formatCartItem(response.cart_item);

          setCartItems((prevItems) => {
            const exists = prevItems.find(
              (item) => item.product_id === cartItem.product_id
            );

            if (exists) {
              return prevItems.map((item) =>
                item.product_id === cartItem.product_id ? cartItem : item
              );
            }

            return [...prevItems, cartItem];
          });
        }
      } catch (error) {
        console.error("Add cart error:", error);
      }
    } else {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.product_id === product.id
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [
          ...prevItems,
          {
            id: product.id,
            user_id: null,
            product_id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          }
        ];
      });
    }
  }, [user]);

  const increaseQuantity = useCallback(async (id) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (!item) return;

    if (user) {
      try {
        const response = await updateCartItem(id, item.quantity + 1);
        if (response.success) {
          const updatedItem = formatCartItem(response.cart_item);
          setCartItems((prevItems) =>
            prevItems.map((cartItem) =>
              cartItem.id === updatedItem.id ? updatedItem : cartItem
            )
          );
        }
      } catch (error) {
        console.error("Increase quantity error:", error);
      }
    } else {
      setCartItems((prevItems) =>
        prevItems.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    }
  }, [cartItems, user]);

  const decreaseQuantity = useCallback(async (id) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (!item || item.quantity <= 1) return;

    if (user) {
      try {
        const response = await updateCartItem(id, item.quantity - 1);
        if (response.success) {
          const updatedItem = formatCartItem(response.cart_item);
          setCartItems((prevItems) =>
            prevItems.map((cartItem) =>
              cartItem.id === updatedItem.id ? updatedItem : cartItem
            )
          );
        }
      } catch (error) {
        console.error("Decrease quantity error:", error);
      }
    } else {
      setCartItems((prevItems) =>
        prevItems.map((cartItem) =>
          cartItem.id === id
            ? {
                ...cartItem,
                quantity: cartItem.quantity > 1 ? cartItem.quantity - 1 : 1
              }
            : cartItem
        )
      );
    }
  }, [cartItems, user]);

  const removeItem = useCallback(async (id) => {
    if (user) {
      try {
        const response = await removeCartItem(id);
        if (response.success) {
          setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
          );
        }
      } catch (error) {
        console.error("Remove item error:", error);
      }
    } else {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== id)
      );
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        const response = await clearUserCart(user.id);
        if (response.success) {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Clear cart error:", error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem("cart");
    }
  }, [user]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  // CartContext is consumed by the Navbar (cart badge count) on every page,
  // so an unmemoized value here caused the whole app shell to re-render on
  // every render of CartProvider, not just when the cart actually changed.
  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      cartTotal
    }),
    [
      cartItems,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      cartTotal
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(CartContext);
