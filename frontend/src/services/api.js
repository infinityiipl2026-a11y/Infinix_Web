const API_BASE_URL = "http://127.0.0.1:5000";

const getAuthHeaders = (user) => ({
  "Content-Type": "application/json",
  "X-User-Role": user?.role || ""
});

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

export const registerUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return response.json();
};

export const fetchProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/product/${id}`);
  return response.json();
};

export const addProduct = async (product, user) => {
  const response = await fetch(`${API_BASE_URL}/add-product`, {
    method: "POST",
    headers: getAuthHeaders(user),
    body: JSON.stringify(product)
  });
  return response.json();
};

export const updateProduct = async (id, product, user) => {
  const response = await fetch(`${API_BASE_URL}/update-product/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(user),
    body: JSON.stringify(product)
  });
  return response.json();
};

export const deleteProduct = async (id, user) => {
  const response = await fetch(`${API_BASE_URL}/delete-product/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(user)
  });
  return response.json();
};

export const adminDashboard = async (user) => {
  const response = await fetch(`${API_BASE_URL}/admin`, {
    headers: getAuthHeaders(user)
  });
  return response.json();
};

export const getCart = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
  return response.json();
};

export const addCartItem = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/add-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });
  return response.json();
};

export const removeCartItem = async (itemId) => {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "DELETE"
  });
  return response.json();
};

export const clearUserCart = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/clear-cart/${userId}`, {
    method: "DELETE"
  });
  return response.json();
};

/* ===========================
   ORDERS API
=========================== */

export const placeOrder = async (payload) => {

  const response = await fetch(
    `${API_BASE_URL}/place-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  return response.json();

};

export const getMyOrders = async (userId) => {

  const response = await fetch(
    `${API_BASE_URL}/my-orders/${userId}`
  );

  return response.json();

};

export const getAllOrders = async (user) => {

  const response = await fetch(
    `${API_BASE_URL}/orders`,
    {
      headers: getAuthHeaders(user)
    }
  );

  return response.json();

};

export const updateOrderStatus = async (
  orderId,
  status,
  user
) => {

  const response = await fetch(
    `${API_BASE_URL}/update-order-status/${orderId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        status
      })
    }
  );

  return response.json();

};