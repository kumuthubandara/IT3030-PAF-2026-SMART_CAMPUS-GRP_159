import { Link } from "react-router-dom";

const REPO_URL =
  "https://github.com/kumuthubandara/IT3030-PAF-2026-SMART_CAMPUS-GRP_159";

const footerLinks = [
  { label: "Privacy", to: "#", external: false },
  { label: "Terms", to: "#", external: false },
  { label: "Support", to: "/contact", external: false },
  { label: "About us", to: "/about", external: false },
  { label: "Contact", to: "/contact", external: false },
  { label: "GitHub", to: REPO_URL, external: true },
];

const linkClass =
  "text-sm text-slate-400 transition hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export default function SiteFooter() {
  return (
    <footer className="border-t border-cyan-500/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:items-center sm:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30"
            aria-hidden
          >
            SC
          </span>
          <p className="text-sm text-slate-400">
            © 2026 SMART CAMPUS Operations Hub
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end"
          aria-label="Footer"
        >
          {footerLinks.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {item.label}
              </a>
            ) : item.to.startsWith("#") ? (
              <a key={item.label} href={item.to} className={linkClass}>
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
