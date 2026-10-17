import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
];

export default function AppHeader() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initials =
    (profile?.full_name ?? profile?.email ?? "?")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-black tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm text-white">
              BR
            </span>
            <span className="hidden sm:inline">
              Bay<span className="text-brand">Ran</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-surface2 text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
              aria-label="Account menu"
            >
              {initials}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-line bg-surface p-2 shadow-lg">
                  <div className="border-b border-line px-2 pb-2 pt-1">
                    <p className="truncate text-sm font-semibold">
                      {profile?.full_name ?? "Team member"}
                    </p>
                    <p className="truncate text-xs text-muted">{profile?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="mt-2 w-full rounded-md px-2 py-2 text-left text-sm font-medium text-red-400 hover:bg-surface2 disabled:opacity-50"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-4 py-1.5 sm:hidden">
        {NAV.map((item) => {
          const active = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-surface2 text-fg" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
