import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await API.get("/api/auth/profile");
      if (res.data.success) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      console.warn("Auth check failed:", err.message);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/api/auth/login", { email, password });
    if (res.data.success) {
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.msg || "Login failed");
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post("/api/auth/register", { name, email, password, phone });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    }
    throw new Error(res.data.msg || "Registration failed");
  };

  const logout = async () => {
    try {
      await API.get("/api/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("current_workspace_id");
      localStorage.removeItem("current_project_id");
      setUser(null);
      window.location.href = "/login";
    }
  };

  const updateProfile = async (data) => {
    const res = await API.put("/api/auth/profile", data);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, ...res.data.user }));
      return res.data;
    }
    throw new Error(res.data.msg || "Failed to update profile");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
