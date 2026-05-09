import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { ACCESS_TOKEN_STORAGE_KEY, getCurrentUser, login as loginRequest } from "./api";

const USER_STORAGE_KEY = "maintcloud.user";

const AuthContext = createContext(null);

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function persistSession(accessToken, user) {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        : null;

    if (!token) {
      setIsReady(true);
      return;
    }

    let active = true;

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();
        if (!active) {
          return;
        }
        setUser(currentUser);
      } catch {
        if (!active) {
          return;
        }
        clearSession();
        setUser(null);
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const payload = await loginRequest({ email, password });
    persistSession(payload.access_token, payload.user);
    setUser(payload.user);
    return payload.user;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
