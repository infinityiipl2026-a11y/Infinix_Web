import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // The backend issues a signed JWT on /login. It must be sent back as
  // `Authorization: Bearer <token>` on every authenticated request (see
  // services/api.js) — the old client-controlled X-User-Role header is no
  // longer read or trusted anywhere on the backend.
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));

  // IMPORTANT: localStorage is written synchronously here, inside the
  // setter itself — not in a useEffect keyed off the state value. If it
  // were done via useEffect, other components (e.g. CartContext) can fire
  // their own effect and read localStorage for the token *before*
  // AuthContext's effect has run, sending an unauthenticated request right
  // after login and getting a 401 back. Writing synchronously guarantees
  // the token is in localStorage before this call returns, regardless of
  // effect ordering.
  const setUser = (value) => {
    setUserState(value);
    if (value) {
      localStorage.setItem("user", JSON.stringify(value));
    } else {
      localStorage.removeItem("user");
    }
  };

  const setToken = (value) => {
    setTokenState(value);
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  };

  // Convenience helper: clears both user and token together (used on
  // logout, or if a request comes back 401/session expired).
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
