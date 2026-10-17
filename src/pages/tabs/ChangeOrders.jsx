import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { CHANGE_ORDER_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "co_number", label: "CO #", type: "number" },
  { key: "description", label: "Description", type: "text", required: true },
  { key: "date_submitted", label: "Date Submitted", type: "date" },
  { key: "date_approved", label: "Date Approved", type: "date" },
  { key: "amount", label: "Amount", type: "currency" },
  { key: "status", label: "Status", type: "select", options: toOptions(CHANGE_ORDER_STATUS_LABEL) },
  { key: "amount_received", label: "Amount Received", type: "currency" },
  { key: "balance_remaining", label: "Balance Remaining", type: "currency", readOnly: true },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function ChangeOrders() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "change_orders");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Change orders</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "change_orders", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "change_orders", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "change_orders", rowId);
          await reload();
        }}
        emptyLabel="No change orders yet."
        addLabel="Add change order"
      />
    </div>
  );
}
