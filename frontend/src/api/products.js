import { API_BASE_URL } from "../config";

export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return response.json();
};

export const getProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/product/${id}`);
  return response.json();
};
