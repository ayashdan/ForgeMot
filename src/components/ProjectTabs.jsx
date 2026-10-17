import { Link, useLocation } from "react-router-dom";

const TABS = [
  { slug: "", label: "Overview" },
  { slug: "tasks", label: "Tasks" },
  { slug: "design", label: "Design" },
  { slug: "measurements", label: "Measurements" },
  { slug: "materials", label: "Materials" },
  { slug: "subs", label: "Subs" },
  { slug: "payments", label: "Payments" },
  { slug: "change-orders", label: "Change Orders" },
  { slug: "scope", label: "Trade Scope" },
  { slug: "punch-list", label: "Punch List" },
];

export default function ProjectTabs({ projectId }) {
  const location = useLocation();

  return (
    <div className="-mx-4 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
      <nav className="flex min-w-max gap-1">
        {TABS.map((tab) => {
          const to = `/projects/${projectId}${tab.slug ? `/${tab.slug}` : ""}`;
          const active = location.pathname === to;
          return (
            <Link
              key={tab.slug}
              to={to}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-brand text-fg"
                  : "border-transparent text-muted hover:border-line hover:text-fg"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
