import { API_BASE_URL } from "../config";

export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load products.");
  }
  return data;
};

export const getProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/product/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Product not found.");
  }
  return data;
};
