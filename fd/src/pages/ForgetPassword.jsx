import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  

  


  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await API.post(
        "/api/auth/forgot-password",
        {
          email,
        }
      );

      alert("OTP sent to your email 📩");

      navigate("/reset-password", {
        state: { email },
      });

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

    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4">

      {/* BACKGROUND BLUR */}

      <div className="absolute left-[-100px] top-[-100px] h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />

      <div className="absolute bottom-[-100px] right-[-100px] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      {/* CARD */}

      <motion.form

        initial={{
          opacity: 0,
          y: 40,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.5,
        }}

        onSubmit={handleSubmit}

        className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
      >

        {/* ICON */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/30">

          <ShieldCheck className="h-10 w-10 text-white" />

        </div>

        {/* HEADING */}

        <h2 className="mt-6 text-center text-4xl font-black text-white">

          Forgot Password

        </h2>

        <p className="mt-3 text-center text-sm text-slate-300">

          Enter your email to receive OTP verification code

        </p>

        {/* INPUT */}

        <div className="mt-8">

          <label className="mb-2 block text-sm font-semibold text-slate-300">

            Email Address

          </label>

          <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">

            <Mail className="h-5 w-5 text-cyan-400" />

            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-transparent px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* BUTTON */}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-cyan-500 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] hover:bg-cyan-600 disabled:opacity-60"
        >

          {loading
            ? "Sending OTP..."
            : "Send OTP 🚀"}

        </button>

      </motion.form>

    </div>
  );
}