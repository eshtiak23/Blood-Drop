/**
 * api.js — Centralized Axios HTTP Client
 *
 * This is the "messenger" that all pages use to talk to the backend server.
 * It handles:
 * - Setting the correct backend URL (from environment variable)
 * - Automatically attaching the JWT token to every request
 * - Handling authentication errors (401) by redirecting to login
 *
 * Usage in other files:
 *   import api from "../services/api";
 *   const response = await api.get("/donors/search?bloodGroup=A+");
 *   const response = await api.post("/auth/login", { email, password });
 *
 * Why centralize? Instead of writing "axios.get(...)" everywhere with the
 * same headers and error handling, we create ONE instance with all the
 * logic built in. If the server URL changes, we only change it here.
 */

import axios from "axios";

// Read the backend URL from Vite environment variables
// Fallback to localhost:5000/api if not set (for development)
// Defensive: ensures the URL always ends with "/api" regardless of what
// the developer puts in VITE_API_URL (e.g., with or without trailing slash)
const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
const baseURL = rawUrl.endsWith("/api") ? rawUrl : rawUrl.replace(/\/+$/, "") + "/api";

// Create a reusable Axios instance with default settings
const api = axios.create({
  baseURL,                                                    // Backend URL (all requests go here)
  headers: { "Content-Type": "application/json" },            // Tell server we send JSON
  timeout: 20000,                                             // 20 second timeout per request
});

/**
 * REQUEST INTERCEPTOR — Runs BEFORE every API request
 * Purpose: Automatically attach the JWT token from localStorage
 * so the user doesn't have to manually add it each time.
 * Called by: Every page that makes API calls (donor search, requests, chat, etc.)
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("blooddrop_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * RESPONSE INTERCEPTOR — Runs AFTER every API response
 * Purpose: Handle 401 (Unauthorized) errors globally.
 * If the server says "token invalid", we clear the login data
 * and redirect to the login page. This prevents users from seeing
 * broken pages when their session expires.
 *
 * Called by: Every API request that gets a 401 response
 * Used by: All protected pages (dashboard, requests, chat, etc.)
 */
api.interceptors.response.use(
  (response) => response,  // Success: pass through as-is
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear everything and redirect
      localStorage.removeItem("blooddrop_token");
      localStorage.removeItem("blooddrop_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
