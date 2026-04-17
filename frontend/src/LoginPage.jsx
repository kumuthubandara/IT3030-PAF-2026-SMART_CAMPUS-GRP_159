import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { getApiBaseUrl } from "./api";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("Navodya");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  useEffect(() => {
    if (user) {
      navigate(searchParams.get("redirect") || "/dashboard", { replace: true });
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    const oauth = searchParams.get("oauth");
    const emailFromOAuth = searchParams.get("email");
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
    const displayName = name.trim() || email.split("@")[0] || "User";
    login({
      name: displayName,
      email: email.trim() || "student@campus.edu",
      role,
    });
    const next = searchParams.get("redirect") || "/dashboard";
    navigate(next, { replace: true });
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
            Demo login: <strong className="text-cyan-400">Student</strong> opens the student hub;{" "}
            <strong className="text-violet-300">Lecturer</strong> opens the lecturer campus view;{" "}
            <strong className="text-indigo-300">Administrator</strong> opens the admin dashboard;{" "}
            <strong className="text-cyan-400">Technician</strong> opens the technician dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="Navodya"
              />
            </div>
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="administrator">Administrator</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300"
            >
              Sign in
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
