import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { PUNCH_LIST_STATUS_LABEL, PUNCH_LIST_PRIORITY_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "area", label: "Area / Room", type: "text" },
  { key: "item", label: "Item", type: "text", required: true },
  { key: "trade", label: "Trade", type: "text" },
  { key: "priority", label: "Priority", type: "select", options: toOptions(PUNCH_LIST_PRIORITY_LABEL) },
  { key: "assigned_to", label: "Assigned To", type: "text" },
  { key: "status", label: "Status", type: "select", options: toOptions(PUNCH_LIST_STATUS_LABEL) },
  { key: "date_identified", label: "Date Identified", type: "date" },
  { key: "date_completed", label: "Date Completed", type: "date" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function PunchList() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "punch_list_items");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  const openCount = rows.filter((r) => r.status !== "complete").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Punch list</h2>
        <span className="text-sm text-muted">{openCount} open</span>
      </div>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "punch_list_items", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "punch_list_items", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "punch_list_items", rowId);
          await reload();
        }}
        emptyLabel="No punch list items yet."
        addLabel="Add item"
      />
    </div>
  );
}
