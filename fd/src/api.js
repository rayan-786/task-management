import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Attach Token & Active Workspace Header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentWorkspaceId = localStorage.getItem("current_workspace_id");
    if (currentWorkspaceId && !config.headers["x-workspace-id"]) {
      config.headers["x-workspace-id"] = currentWorkspaceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if already on an auth route
      const path = window.location.pathname;
      if (!["/login", "/register", "/forgot-password", "/reset-password"].includes(path)) {
        localStorage.removeItem("token");
        window.location.href = "/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default API;