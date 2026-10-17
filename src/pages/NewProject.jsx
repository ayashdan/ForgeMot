import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/ProjectForm";
import { createProject } from "../lib/data";
import { useAuth } from "../contexts/AuthContext";

export default function NewProject() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  async function handleSubmit(fields) {
    const id = await createProject(fields, currentUser);
    navigate(`/projects/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">New project</h1>
      <p className="mb-6 text-sm text-muted">Set up a new customer job.</p>
      <ProjectForm onSubmit={handleSubmit} submitLabel="Create project" />
    </div>
  );
}
