import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { apiPost, getApiBaseUrl } from "./api";

export default function SignUpPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters for the password.");
      return;
    }

    setIsSubmitting(true);
    apiPost("/api/auth/signup", {
      name: name.trim(),
      email: email.trim(),
      password,
    })
      .then((data) => {
        login({
          name: data.name,
          email: data.email,
          role: data.role,
          authProvider: data.authProvider || "local",
        });
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        setError(err.message || "Unable to create account");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link
          to="/"
          className="mb-8 flex items-center gap-3 text-slate-400 transition hover:text-cyan-400"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
            SC
          </span>
          <span className="font-heading text-lg font-semibold text-cyan-300">
            Smart Campus
          </span>
        </Link>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-8 shadow-xl shadow-cyan-950/30">
          <h1 className="font-heading text-2xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Create your Smart Campus account to manage bookings, tickets, and notifications.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-slate-300">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Campus email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="you@university.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account & continue"}
            </button>
            <a
              href={`${getApiBaseUrl()}/oauth2/authorization/google`}
              className="block w-full rounded-xl border border-slate-600/80 bg-slate-950/80 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-cyan-400/50 hover:text-cyan-300"
            >
              Create account with Google
            </a>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
