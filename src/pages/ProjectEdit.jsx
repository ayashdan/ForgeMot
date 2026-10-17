import { useNavigate, useOutletContext, Link } from "react-router-dom";
import ProjectForm from "../components/ProjectForm";
import ConfirmButton from "../components/ConfirmButton";
import { updateProject, deleteProject } from "../lib/data";

export default function ProjectEdit() {
  const { project } = useOutletContext();
  const navigate = useNavigate();

  async function handleSubmit(fields) {
    await updateProject(project.id, fields);
    navigate(`/projects/${project.id}`);
  }

  async function handleDelete() {
    await deleteProject(project.id);
    navigate("/projects");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link to={`/projects/${project.id}`} className="text-sm text-muted hover:text-fg">
          ← Back to project
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Edit project</h1>
      </div>

      <ProjectForm onSubmit={handleSubmit} project={project} submitLabel="Save changes" />

      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="mb-2 text-sm font-semibold text-red-300">Danger zone</p>
        <p className="mb-3 text-sm text-muted">
          Deleting a project permanently removes all of its tasks, selections, materials, subs,
          payments, and change orders.
        </p>
        <ConfirmButton
          onConfirm={handleDelete}
          confirmText={`Delete "${project.name}"? This cannot be undone.`}
          pendingText="Deleting…"
          className="press rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
        >
          Delete project
        </ConfirmButton>
      </div>
    </div>
  );
}
