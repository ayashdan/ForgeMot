import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { DESIGN_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "area", label: "Area / Room", type: "text" },
  { key: "item", label: "Item / Selection", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "status", label: "Status", type: "select", options: toOptions(DESIGN_STATUS_LABEL) },
  { key: "selected_by", label: "Selected By", type: "text" },
  { key: "date_selected", label: "Date Selected", type: "date" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Design() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "design_selections");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Design &amp; selections</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "design_selections", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "design_selections", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "design_selections", rowId);
          await reload();
        }}
        emptyLabel="No selections yet."
        addLabel="Add selection"
      />
    </div>
  );
}
