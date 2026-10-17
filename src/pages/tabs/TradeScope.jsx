import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { TRADE_SCOPE_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "trade", label: "Trade", type: "text", required: true },
  { key: "scope_item", label: "Scope Item", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "status", label: "Status", type: "select", options: toOptions(TRADE_SCOPE_STATUS_LABEL) },
  { key: "assigned_sub", label: "Assigned Sub", type: "text" },
  { key: "start_date", label: "Start Date", type: "date" },
  { key: "complete_date", label: "Complete Date", type: "date" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function TradeScope() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "trade_scope");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Scope of work by trade</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "trade_scope", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "trade_scope", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "trade_scope", rowId);
          await reload();
        }}
        emptyLabel="No trade scope items yet."
        addLabel="Add scope item"
      />
    </div>
  );
}
