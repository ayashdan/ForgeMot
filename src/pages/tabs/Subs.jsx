import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { SUB_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "trade", label: "Trade", type: "text" },
  { key: "company", label: "Sub / Company", type: "text", required: true },
  { key: "contact", label: "Contact", type: "text" },
  { key: "contract_amount", label: "Contract Amount", type: "currency" },
  { key: "amount_paid", label: "Amount Paid", type: "currency" },
  { key: "balance_due", label: "Balance Due", type: "currency", readOnly: true },
  { key: "last_payment_date", label: "Last Payment Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: toOptions(SUB_STATUS_LABEL) },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Subs() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "subcontractors");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Subcontractors &amp; payments out</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "subcontractors", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "subcontractors", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "subcontractors", rowId);
          await reload();
        }}
        emptyLabel="No subcontractors yet."
        addLabel="Add subcontractor"
      />
    </div>
  );
}
