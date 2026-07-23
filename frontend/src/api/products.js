import { API_BASE_URL } from "../config";

// Home, Shop, and ProductDetail each call getProducts()/getProduct() on
// mount, so a user browsing Home -> Shop -> a product -> back to Shop can
// trigger 3-4 fetches for a catalog that barely changes minute to minute.
// This is a small in-memory cache (cleared on page reload, which is fine --
// it's just meant to smooth out in-session navigation, not be a source of
// truth). Entries expire after CACHE_TTL_MS so admin edits still show up
// reasonably quickly, and are also invalidated immediately whenever
// addProduct/updateProduct/deleteProduct run (see services/api.js).
const CACHE_TTL_MS = 60_000;
const cache = new Map(); // key -> { data, expiresAt }
const inFlight = new Map(); // key -> Promise, dedupes concurrent identical requests

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  if (entry) cache.delete(key);
  return undefined;
};

const setCached = (key, data) => {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

// Exported so services/api.js can wipe the cache after a mutation.
export const invalidateProductsCache = () => {
  cache.clear();
};

const cachedFetch = async (key, url, notFoundMessage) => {
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  if (inFlight.has(key)) return inFlight.get(key);

  const requestPromise = (async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || notFoundMessage);
      }
      setCached(key, data);
      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, requestPromise);
  return requestPromise;
};

export const getProducts = () =>
  cachedFetch("products", `${API_BASE_URL}/products`, "Unable to load products.");

export const getProduct = (id) =>
  cachedFetch(`product:${id}`, `${API_BASE_URL}/product/${id}`, "Product not found.");
