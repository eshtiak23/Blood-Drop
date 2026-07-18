import axios from "axios";

const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
const baseURL = rawUrl.endsWith("/api") ? rawUrl : rawUrl.replace(/\/+$/, "") + "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("blooddrop_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("blooddrop_token");
      localStorage.removeItem("blooddrop_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
