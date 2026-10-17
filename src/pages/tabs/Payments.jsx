import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { PAYMENT_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "payment_number", label: "Payment #", type: "number" },
  { key: "description", label: "Description / Milestone", type: "text" },
  { key: "amount_due", label: "Amount Due", type: "currency" },
  { key: "amount_received", label: "Amount Received", type: "currency" },
  { key: "balance_remaining", label: "Balance Remaining", type: "currency", readOnly: true },
  { key: "date_received", label: "Date Received", type: "date" },
  { key: "payment_method", label: "Payment Method", type: "text" },
  { key: "status", label: "Status", type: "select", options: toOptions(PAYMENT_STATUS_LABEL) },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Payments() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "customer_payments");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Customer payments (incoming)</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "customer_payments", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "customer_payments", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "customer_payments", rowId);
          await reload();
        }}
        emptyLabel="No payments recorded yet."
        addLabel="Add payment"
      />
    </div>
  );
}
