import { useState } from "react";

import API from "../api";

import {
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import {
  Mail,
  KeyRound,
} from "lucide-react";

export default function VerifyOTP() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const email =
    location.state?.email ||
    localStorage.getItem(
      "email"
    );

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ================= VERIFY =================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!email) {
      alert(
        "Email missing. Please register again."
      );

      navigate("/register");

      return;
    }

    try {
      setLoading(true);

        await API.post(
          "/api/auth/verify-otp",
          {
            email,
            otp: otp.trim(),
          }
        );

      alert(
        "Account verified successfully"
      );

    
navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          "Invalid OTP"
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
            Verify OTP
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter the verification code sent to your email.
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

            <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3">
              
              <Mail className="h-4 w-4 text-slate-400" />

              <input
                type="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed bg-transparent px-3 py-3 text-sm text-slate-500 outline-none"
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
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                  )
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
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        {/* FOOTER */}

        <p className="mt-6 text-center text-sm text-slate-500">
          Didn’t receive OTP?{" "}
          
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Register Again
          </Link>
        </p>
      </div>
    </div>
  );
}