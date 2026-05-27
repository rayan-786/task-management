import { useState } from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import API from "../api";

export default function Login() {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  // ================= LOGIN =================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res =
        await API.post(
          "/api/auth/login",
          form
        );

      // SAVE TOKEN

      localStorage.setItem(
        "token",
        res.data.token
      );

      // REDIRECT PROFILE

      navigate("/profile");
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        
        {/* HEADER */}

        <div className="mb-8">
          
          <h1 className="text-2xl font-semibold text-slate-800">
            Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Login to manage tasks and teams.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          
          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter email"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              required
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password:
                    e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter password"
            />
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* LINKS */}

        <div className="mt-6 flex items-center justify-between text-sm">
          
          <Link
            to="/forgot-password"
            className="text-slate-500 hover:text-slate-700"
          >
            Forgot password?
          </Link>

          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}