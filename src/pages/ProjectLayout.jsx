import { useEffect, useState, useCallback } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { getProject } from "../lib/data";
import StatusBadge from "../components/StatusBadge";
import ProjectTabs from "../components/ProjectTabs";
import { PROJECT_STATUS_LABEL } from "../lib/constants";

export default function ProjectLayout() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(async () => {
    const p = await getProject(id);
    if (!p) {
      setNotFound(true);
      return;
    }
    setProject(p);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <p className="mb-2 text-lg font-semibold">Project not found</p>
        <Link to="/projects" className="text-sm font-medium text-brand hover:underline">
          Back to all projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return <div className="py-20 text-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link to="/projects" className="text-sm text-muted hover:text-fg">
          ← All projects
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status} label={PROJECT_STATUS_LABEL[project.status]} />
            </div>
            <p className="text-sm text-muted">{project.client_name}</p>
          </div>
          <Link
            to={`/projects/${project.id}/edit`}
            className="press rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-brand/50"
          >
            Edit project
          </Link>
        </div>
      </div>

      <ProjectTabs projectId={project.id} />

      <Outlet context={{ project, reloadProject: reload }} />
    </div>
  );
}
