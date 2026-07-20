import { render, screen } from "@testing-library/react";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";

// The original CRA boilerplate test checked for a "learn react" link that
// never existed in this app, so it was failing from day one. This is a
// minimal real smoke test instead: render the app inside its actual
// providers and confirm it mounts without throwing.
test("renders the app shell without crashing", () => {
  render(
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );

  expect(screen.getByRole("heading", { name: /welcome to/i })).toBeInTheDocument();
});
