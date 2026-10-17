import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProjectsWithFinancials } from "../lib/aggregate";
import ProjectCard from "../components/ProjectCard";
import { PROJECT_STATUS_LABEL } from "../lib/constants";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: PROJECT_STATUS_LABEL.active },
  { value: "on_hold", label: PROJECT_STATUS_LABEL.on_hold },
  { value: "complete", label: PROJECT_STATUS_LABEL.complete },
  { value: "cancelled", label: PROJECT_STATUS_LABEL.cancelled },
];

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("status") ?? "all";

  useEffect(() => {
    getProjectsWithFinancials().then(setProjects);
  }, []);

  if (!projects) {
    return <div className="py-20 text-center text-sm text-muted">Loading…</div>;
  }

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted">
            {projects.length} project{projects.length === 1 ? "" : "s"} total.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="press whitespace-nowrap rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-soft"
        >
          + New project
        </Link>
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSearchParams(f.value === "all" ? {} : { status: f.value })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value ? "bg-surface2 text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
          No projects match this filter.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
