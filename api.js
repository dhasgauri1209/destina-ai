import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("destina_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ["/login", "/register"];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem("destina_token");
        localStorage.removeItem("destina_user_name");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
