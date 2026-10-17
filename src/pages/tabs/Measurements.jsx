import { useParams } from "react-router-dom";
import EntityTable from "../../components/EntityTable";
import { useSubcollection } from "../../hooks/useSubcollection";
import { createSubdoc, updateSubdoc, deleteSubdoc } from "../../lib/data";

const fields = [
  { key: "area", label: "Area / Room", type: "text", required: true },
  { key: "width_ft", label: "Width (ft)", type: "number" },
  { key: "length_ft", label: "Length (ft)", type: "number" },
  { key: "height_ft", label: "Height (ft)", type: "number" },
  { key: "floor_sqft", label: "Floor Sq Ft", type: "number", readOnly: true },
  { key: "perimeter_lf", label: "Perimeter (LF)", type: "number", readOnly: true },
  { key: "wall_sqft", label: "Wall Sq Ft", type: "number", readOnly: true },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Measurements() {
  const { id } = useParams();
  const { rows, reload } = useSubcollection(id, "room_measurements");

  if (!rows) return <div className="py-10 text-center text-sm text-muted">Loading…</div>;

  const totalFloor = rows.reduce((sum, r) => sum + Number(r.floor_sqft ?? 0), 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Room measurements</h2>
        <span className="text-sm text-muted">Total floor: {totalFloor.toLocaleString()} sq ft</span>
      </div>
      <EntityTable
        fields={fields}
        rows={rows}
        onCreate={async (f) => {
          await createSubdoc(id, "room_measurements", f);
          await reload();
        }}
        onUpdate={async (rowId, f) => {
          await updateSubdoc(id, "room_measurements", rowId, f);
          await reload();
        }}
        onDelete={async (rowId) => {
          await deleteSubdoc(id, "room_measurements", rowId);
          await reload();
        }}
        emptyLabel="No measurements yet."
        addLabel="Add area"
      />
    </div>
  );
}
