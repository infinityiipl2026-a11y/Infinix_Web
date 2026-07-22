import { API_BASE_URL } from "../config";

/* ===========================
   AUTH TOKEN HELPERS
=========================== */

// The backend now issues a signed JWT on /login instead of trusting a
// client-supplied X-User-Role header. The token is stored under the same
// "token" key that AuthContext manages, so it stays in sync across the app
// without every caller needing to thread it through manually.
const getToken = () => localStorage.getItem("token");

const authHeaders = (includeJson = true) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Wraps fetch() for authenticated endpoints only (ones sending an
// Authorization header). If the backend responds 401 -- expired or
// invalid token -- this clears the stored session and sends the user to
// /login, instead of leaving them on a page that silently keeps failing
// every request. Deliberately NOT used for /login itself: a wrong
// password there also returns 401, and treating that as "session
// expired, redirect to /login" would just reload the login page the
// user is already on.
const authFetch = async (url, options) => {
  const response = await fetch(url, options);

  if (response.status === 401 && !window.location.pathname.startsWith("/login")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return response;
};

/* ===========================
   AUTH API
=========================== */

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

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return response.json();
};

export const resetPassword = async (token, password) => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  return response.json();
};

/* ===========================
   PRODUCTS API
=========================== */

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return response.json();
};

export const fetchProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/product/${id}`);
  return response.json();
};

// `product` is a FormData instance (multipart, includes the image file).
// Don't set Content-Type manually here — the browser needs to set it
// itself so it can include the multipart boundary.
export const addProduct = async (formData) => {
  const response = await authFetch(`${API_BASE_URL}/add-product`, {
    method: "POST",
    headers: authHeaders(false),
    body: formData
  });
  return response.json();
};

export const updateProduct = async (id, product) => {
  const response = await authFetch(`${API_BASE_URL}/update-product/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(product)
  });
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/delete-product/${id}`, {
    method: "DELETE",
    headers: authHeaders(false)
  });
  return response.json();
};

export const adminDashboard = async () => {
  const response = await authFetch(`${API_BASE_URL}/admin`, {
    headers: authHeaders(false)
  });
  return response.json();
};

/* ===========================
   CART API
=========================== */

export const getCart = async (userId) => {
  const response = await authFetch(`${API_BASE_URL}/cart/${userId}`, {
    headers: authHeaders(false)
  });
  return response.json();
};

export const addCartItem = async (payload) => {
  const response = await authFetch(`${API_BASE_URL}/add-cart`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return response.json();
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await authFetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ quantity })
  });
  return response.json();
};

export const removeCartItem = async (itemId) => {
  const response = await authFetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(false)
  });
  return response.json();
};

export const clearUserCart = async (userId) => {
  const response = await authFetch(`${API_BASE_URL}/clear-cart/${userId}`, {
    method: "DELETE",
    headers: authHeaders(false)
  });
  return response.json();
};

/* ===========================
   ORDERS API
=========================== */

export const placeOrder = async (payload) => {
  const response = await authFetch(`${API_BASE_URL}/place-order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return response.json();
};

export const getMyOrders = async (userId) => {
  const response = await authFetch(`${API_BASE_URL}/my-orders/${userId}`, {
    headers: authHeaders(false)
  });
  return response.json();
};

export const getAllOrders = async () => {
  const response = await authFetch(`${API_BASE_URL}/orders`, {
    headers: authHeaders(false)
  });
  return response.json();
};

export const getAdminAnalytics = async () => {
  const response = await authFetch(`${API_BASE_URL}/admin/analytics`, {
    headers: authHeaders(false)
  });
  return response.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await authFetch(`${API_BASE_URL}/update-order-status/${orderId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status })
  });
  return response.json();
};
