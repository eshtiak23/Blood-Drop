/**
 * AuthContext.jsx — User Authentication (Login/Register/Logout)
 * 
 * This file handles everything related to user accounts. It communicates
 * with the backend API and stores the JWT token for session persistence.
 * 
 * How it works:
 * - JWT token is stored under "blooddrop_token" in localStorage
 * - User data is stored under "blooddrop_user" in localStorage
 * - On first load, it validates the stored token via the API
 * 
 * Any page can access user info by calling: const { user } = useAuth();
 * 
 * Available functions:
 * - login(email, password) → Log in an existing user
 * - register(userData) → Create a new account and log in
 * - logout() → Sign out
 * - updateUser(fields) → Update the current user's profile
 * - isAuthenticated → true if someone is logged in
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: validate stored token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("blooddrop_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then((res) => { setUser(res.data.user); localStorage.setItem("blooddrop_user", JSON.stringify(res.data.user)); })
      .catch(() => { localStorage.removeItem("blooddrop_token"); localStorage.removeItem("blooddrop_user"); })
      .finally(() => setLoading(false));
  }, []);

  /** login — Sign in with email and password via API */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (!res.data?.token || !res.data?.user) throw new Error("Invalid server response");
    localStorage.setItem("blooddrop_token", res.data.token);
    localStorage.setItem("blooddrop_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  /** register — Create a new account and log in via API */
  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    if (!res.data?.token || !res.data?.user) throw new Error("Invalid server response");
    localStorage.setItem("blooddrop_token", res.data.token);
    localStorage.setItem("blooddrop_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  /** logout — Remove token and user data */
  const logout = () => {
    localStorage.removeItem("blooddrop_token");
    localStorage.removeItem("blooddrop_user");
    setUser(null);
  };

  /** updateUser — Update current user's profile via API and refresh local state */
  const updateUser = async (updates) => {
    const res = await api.put("/auth/me", updates);
    setUser(res.data.user);
    localStorage.setItem("blooddrop_user", JSON.stringify(res.data.user));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
