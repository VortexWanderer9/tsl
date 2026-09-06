import { createContext, useContext, useEffect, useState } from "react";
import { ensureDefaultAdmin, getSessionUser, login as loginFn, logout as logoutFn } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureDefaultAdmin();
      setUser(getSessionUser());
      setReady(true);
    })();
  }, []);

  async function login(username, password) {
    const res = await loginFn(username, password);
    if (res.ok) setUser(res.user);
    return res;
  }

  function logout() {
    logoutFn();
    setUser(null);
  }

  function refreshUser() {
    setUser(getSessionUser());
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
