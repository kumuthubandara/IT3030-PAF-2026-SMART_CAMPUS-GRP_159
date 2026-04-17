import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { apiPost, getApiBaseUrl } from "./api";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(searchParams.get("redirect") || "/dashboard", { replace: true });
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    const oauth = searchParams.get("oauth");
    const emailFromOAuth = searchParams.get("email");
    if (oauth === "error") {
      setError(searchParams.get("message") || "Google sign-in failed.");
      return;
    }
    if (oauth !== "success" || !emailFromOAuth) return;
    login({
      name: searchParams.get("name") || emailFromOAuth.split("@")[0],
      email: emailFromOAuth,
      role: searchParams.get("role") || "user",
      authProvider: "google",
    });
    navigate("/dashboard", { replace: true });
  }, [login, navigate, searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    apiPost("/api/auth/login", {
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
        const next = searchParams.get("redirect") || "/dashboard";
        navigate(next, { replace: true });
      })
      .catch((err) => {
        setError(err.message || "Unable to sign in");
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
          <h1 className="font-heading text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with your Smart Campus account, or continue with Google.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
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
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <a
              href={`${getApiBaseUrl()}/oauth2/authorization/google`}
              className="block w-full rounded-xl border border-slate-600/80 bg-slate-950/80 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-cyan-400/50 hover:text-cyan-300"
            >
              Continue with Google
            </a>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New to SMART CAMPUS?{" "}
            <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
