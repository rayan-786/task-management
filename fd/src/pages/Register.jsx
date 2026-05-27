import { useState } from "react";

import API from "../api";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

export default function Register() {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

  // ================= SUBMIT =================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      // REGISTER USER

      const res =
        await API.post(
          "/api/auth/register",
          form
        );

      // SUCCESS MESSAGE

      alert(
        res.data?.msg ||
          "Account created successfully"
      );

      // CLEAR FORM

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      // REDIRECT LOGIN

      navigate("/login", {
  state: {
    email: form.email,
  },
});
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          "Registration failed"
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
            Create account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your tasks and team in one place.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              
              <User className="h-4 w-4 text-slate-400" />

              <input
                type="text"
                required
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target.value,
                  })
                }
                className="w-full px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>

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
                placeholder="Enter your email"
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

          {/* PHONE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              
              <Phone className="h-4 w-4 text-slate-400" />

              <input
                type="text"
                required
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone:
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
              Password
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              
              <Lock className="h-4 w-4 text-slate-400" />

              <input
                type="password"
                required
                placeholder="Create password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
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
              ? "Creating..."
              : "Create Account"}
          </button>
        </form>

        {/* FOOTER */}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}