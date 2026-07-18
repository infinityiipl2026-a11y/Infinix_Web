// Centralized frontend configuration.
//
// The backend URL now comes from an environment variable instead of being
// hardcoded as http://127.0.0.1:5000 in every file. Create React App only
// exposes env vars prefixed with REACT_APP_, and it inlines them at BUILD
// time — so after changing .env you must restart `npm start` (dev) or
// re-run `npm run build` (production) for the new value to take effect.
//
// See .env.example for the variable this reads.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

// Product images uploaded via /add-product are stored on the backend and
// served back out at /uploads/<filename>. Anything else (external URLs,
// local /images/... paths bundled with the frontend) is used as-is.
export const resolveImageUrl = (image) => {
  if (!image) return image;
  return image.startsWith("/uploads") ? `${API_BASE_URL}${image}` : image;
};
