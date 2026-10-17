import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { TASK_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "title", label: "Task", type: "text", required: true },
  { key: "category", label: "Category", type: "text" },
  { key: "assigned_to", label: "Assigned To", type: "text" },
  { key: "start_date", label: "Start Date", type: "date" },
  { key: "due_date", label: "Due Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: toOptions(TASK_STATUS_LABEL) },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Tasks() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "tasks");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Tasks</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "tasks", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "tasks", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "tasks", rowId);
          await reload();
        }}
        emptyLabel="No tasks yet."
        addLabel="Add task"
      />
    </div>
  );
}
