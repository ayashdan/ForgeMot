import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

const FEATURES = [
  {
    icon: "📊",
    title: "One dashboard, every job",
    description:
      "Contract value, balance due, and estimated margin across every active project, at a glance.",
  },
  {
    icon: "✅",
    title: "Nothing falls through the cracks",
    description:
      "Overdue tasks, pending change orders, backordered materials, and open punch list items surface automatically.",
  },
  {
    icon: "🧰",
    title: "Built for the whole job",
    description:
      "Tasks, design selections, materials, subs, payments, change orders, trade scope, and punch list — one workspace per project.",
  },
];

export default function Login() {
  const { currentUser, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (!loading && currentUser) return <Navigate to="/dashboard" replace />;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint-grid" aria-hidden="true" />

      <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-2xl font-black text-white shadow-lg shadow-brand/20">
          BR
        </div>
        <h1 className="mb-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Bay<span className="text-brand">Ran</span>
        </h1>
        <p className="mb-10 max-w-md text-lg text-muted">
          Run every job from one place — schedules, selections, materials,
          subs, and payments, across every active project.
        </p>

        {searchParams.get("error") && (
          <p className="mb-6 w-full max-w-sm rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {searchParams.get("error")}
          </p>
        )}

        <GoogleSignInButton className="w-full max-w-xs" />

        <p className="mt-6 text-xs text-muted">
          Sign in with your company Google account to access your projects.
        </p>
      </div>

      <div className="border-t border-line bg-surface/40 px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-line bg-surface p-6 text-left transition hover:border-brand/40"
            >
              <div className="mb-3 text-2xl" aria-hidden="true">
                {f.icon}
              </div>
              <h2 className="mb-1.5 font-semibold">{f.title}</h2>
              <p className="text-sm text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="px-6 py-8 text-center text-xs text-muted">
        BayRan — built for construction teams running multiple projects at once.
      </footer>
    </main>
  );
}
