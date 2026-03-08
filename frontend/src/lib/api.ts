import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://quantlab-api-wa0r.onrender.com";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach token if present — but never redirect or block
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ql_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
