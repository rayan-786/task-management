import { useState } from "react";

import API from "../api";

import {
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";

import {
  Mail,
  Lock,
  KeyRound,
} from "lucide-react";

export default function ResetPassword() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  // ================= EMAIL =================

  const email =
    location.state?.email || "";

  // ================= FORM =================

  const [form, setForm] =
    useState({
      email,
      otp: "",
      newPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  // ================= SUBMIT =================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post(
        "/auth/reset-password",
        {
          email:
            form.email.trim(),

          otp:
            form.otp.trim(),

          newPassword:
            form.newPassword,
        }
      );

      alert(
        "Password reset successful ✅"
      );

      navigate("/");
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      
      {/* CARD */}

      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        
        {/* HEADER */}

        <div className="mb-8">
          
          <h1 className="text-2xl font-semibold text-slate-800">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your OTP and create a new password.
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

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              
              <Mail className="h-4 w-4 text-slate-400" />

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
                className="w-full px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* OTP */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              OTP Code
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              
              <KeyRound className="h-4 w-4 text-slate-400" />

              <input
                type="text"
                required
                placeholder="Enter OTP"
                value={form.otp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    otp:
                      e.target.value,
                  })
                }
                className="w-full px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              
              <Lock className="h-4 w-4 text-slate-400" />

              <input
                type="password"
                required
                placeholder="Create password"
                value={
                  form.newPassword
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    newPassword:
                      e.target.value,
                  })
                }
                className="w-full px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        {/* FOOTER */}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          
          <Link
            to="/"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}