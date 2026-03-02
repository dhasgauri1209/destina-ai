import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { email: form.email.trim(), password: form.password };
      const response = await api.post("/login", payload);
      const token = response.data?.data?.access_token;
      const userName = response.data?.data?.user_name;
      if (!token) throw new Error("Access token missing.");

      localStorage.setItem("destina_token", token);
      localStorage.setItem("destina_user_name", userName || "Traveler");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container flex min-h-[82vh] items-center justify-center py-12">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass w-full max-w-md rounded-3xl p-7"
      >
        <h1 className="font-heading text-3xl font-bold text-white light:text-slate-900">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-300 light:text-slate-600">Access your premium trip workspace.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-200 light:text-slate-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900"
            />
          </div>
          <div>
            <label className="text-sm text-slate-200 light:text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={loading} className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary via-secondary to-accent py-3 text-sm font-semibold text-white">
          {loading ? "Signing in..." : "Login"}
        </motion.button>

        <p className="mt-4 text-sm text-slate-300 light:text-slate-600">
          New user? <Link to="/register" className="font-semibold text-secondary">Create account</Link>
        </p>
      </motion.form>
    </main>
  );
}

export default Login;
