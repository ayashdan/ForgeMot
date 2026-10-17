import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";
import { MATERIAL_STATUS_LABEL, toOptions } from "../../lib/constants";

const fields = [
  { key: "area", label: "Area / Room", type: "text" },
  { key: "material", label: "Material", type: "text", required: true },
  { key: "vendor", label: "Vendor / Supplier", type: "text" },
  { key: "qty", label: "Qty", type: "number" },
  { key: "unit", label: "Unit", type: "text" },
  { key: "unit_cost", label: "Unit Cost", type: "currency" },
  { key: "total_cost", label: "Total Cost", type: "currency", readOnly: true },
  { key: "status", label: "Status", type: "select", options: toOptions(MATERIAL_STATUS_LABEL) },
  { key: "order_date", label: "Order Date", type: "date" },
  { key: "po_number", label: "PO #", type: "text" },
  { key: "charged_to_customer", label: "Charged to Customer", type: "currency" },
  { key: "materials_profit", label: "Profit", type: "currency", readOnly: true },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Materials() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "materials");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Material selections &amp; orders</h2>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "materials", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "materials", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "materials", rowId);
          await reload();
        }}
        emptyLabel="No materials yet."
        addLabel="Add material"
      />
    </div>
  );
}
