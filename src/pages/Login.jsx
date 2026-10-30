
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-16 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-3 text-3xl font-bold">WELCOME BACK</h1>
        <p className="mb-8 text-gray-400">
          Sign in to your Pulse Fitness account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-[#444] bg-[#141414] p-3 text-white outline-none focus:border-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-[#444] bg-[#141414] p-3 text-white outline-none focus:border-white"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-white bg-white p-3 font-semibold text-black transition hover:bg-transparent hover:text-white disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-white underline">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
