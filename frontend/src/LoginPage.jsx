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
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(searchParams.get("redirect") || "/dashboard", { replace: true });
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    const oauth = searchParams.get("oauth");
    const emailFromOAuth = searchParams.get("email");
    // Avoid replacing an existing session with stale ?oauth=success query params.
    if (oauth === "success" && user) {
      return;
    }
    if (oauth === "error") {
      setError(searchParams.get("message") || "Google sign-in failed.");
      setInfoMessage("");
      return;
    }
    if (oauth === "pending") {
      setInfoMessage(
        emailFromOAuth
          ? `Google sign-in completed for ${emailFromOAuth}, but an administrator must approve your account before you can use the app.`
          : "Your account is waiting for administrator approval before you can sign in."
      );
      setError("");
      return;
    }
    if (oauth !== "success" || !emailFromOAuth) return;
    login({
      name: searchParams.get("name") || emailFromOAuth.split("@")[0],
      email: emailFromOAuth,
      role: searchParams.get("role") || "student",
      authProvider: "google",
      accountStatus: (searchParams.get("accountStatus") || "active").toLowerCase(),
    });
    navigate("/dashboard", { replace: true });
  }, [login, navigate, searchParams, user]);

  useEffect(() => {
    const registered = searchParams.get("registered");
    const reason = searchParams.get("reason");
    if (registered === "pending") {
      setInfoMessage(
        "Registration received. An administrator will approve your account; you can sign in after approval."
      );
      setError("");
    } else if (reason === "pending") {
      setInfoMessage("Your account is still waiting for administrator approval.");
      setError("");
    }
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfoMessage("");
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
          accountStatus: String(data.accountStatus || "active").toLowerCase(),
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

          <details className="mt-5 rounded-xl border border-slate-600/60 bg-slate-950/50 px-4 py-3 text-left">
            <summary className="cursor-pointer text-sm font-medium text-amber-200/95">
              Administrator sign-in (campus staff)
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-slate-400">
              <li>
                In the <code className="rounded bg-slate-800 px-1 text-slate-200">backend</code> folder, set{" "}
                <code className="rounded bg-slate-800 px-1 text-slate-200">BOOTSTRAP_ADMIN_EMAIL</code> and{" "}
                <code className="rounded bg-slate-800 px-1 text-slate-200">BOOTSTRAP_ADMIN_PASSWORD</code> in{" "}
                <code className="rounded bg-slate-800 px-1 text-slate-200">.env</code> (see{" "}
                <code className="rounded bg-slate-800 px-1 text-slate-200">.env.example</code>).
              </li>
              <li>
                Run the backend from that folder (<code className="rounded bg-slate-800 px-1">cd backend</code> then{" "}
                <code className="rounded bg-slate-800 px-1">.\mvnw.cmd spring-boot:run</code>) so{" "}
                <code className="rounded bg-slate-800 px-1">.env</code> loads. Restart after changing{" "}
                <code className="rounded bg-slate-800 px-1">.env</code>.
              </li>
              <li>
                Sign in below with <strong className="text-slate-300">that same email and password</strong>. You
                should land on the Admin dashboard. If you previously signed up as a student with the same email,
                the server promotes that pending account to administrator on startup.
              </li>
              <li className="text-slate-500">
                After first login, remove <code className="rounded bg-slate-800 px-1">BOOTSTRAP_ADMIN_PASSWORD</code>{" "}
                from <code className="rounded bg-slate-800 px-1">.env</code> for security.
              </li>
            </ol>
          </details>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {infoMessage ? (
              <p className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                {infoMessage}
              </p>
            ) : null}
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
