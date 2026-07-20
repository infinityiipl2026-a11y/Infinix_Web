import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./global.css";

import {
  CartProvider
} from "./context/CartContext";

import {
  SearchProvider
} from "./context/SearchContext";

import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

const root =
  ReactDOM.createRoot(
    document.getElementById("root")
  );

root.render(
  <React.StrictMode>

    <ErrorBoundary>

      <AuthProvider>

        <CartProvider>

          <SearchProvider>

            <App />

          </SearchProvider>

        </CartProvider>

      </AuthProvider>

    </ErrorBoundary>

  </React.StrictMode>
);