import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGithub, FaBolt } from "react-icons/fa";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post(
        "/api/auth/login",
        form
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

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

  const githubLogin = () => {
  window.location.href =
    `${import.meta.env.VITE_API_URL}/api/auth/github`;
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <FaBolt size={24} />
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your tasks and teams
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="john@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              required
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-70"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* DIVIDER */}

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-200"></div>

          <span className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400">
            Or continue with
          </span>

          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {/* GITHUB BUTTON */}

        <button
          onClick={githubLogin}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 hover:shadow-md"
        >
          <FaGithub
            size={22}
            className="text-black"
          />

          Continue with GitHub
        </button>

        <p className="mt-3 text-center text-xs text-slate-500">
          Secure authentication powered by
          GitHub OAuth
        </p>

        {/* LINKS */}

        <div className="mt-8 flex items-center justify-between text-sm">

          <Link
            to="/forgot-password"
            className="text-slate-500 hover:text-slate-700"
          >
            Forgot password?
          </Link>

          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create account
          </Link>

        </div>

      </div>
    </div>
  );
}