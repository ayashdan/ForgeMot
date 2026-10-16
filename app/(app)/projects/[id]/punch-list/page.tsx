import { createClient } from "@/lib/supabase/server";
import EntityTable, { type FieldDef } from "@/components/EntityTable";
import { PUNCH_LIST_STATUS_LABEL, PUNCH_LIST_PRIORITY_LABEL } from "@/lib/types";
import { createPunchListItem, updatePunchListItem, deletePunchListItem } from "./actions";

const fields: FieldDef[] = [
  { key: "area", label: "Area / Room", type: "text" },
  { key: "item", label: "Item", type: "text", required: true },
  { key: "trade", label: "Trade", type: "text" },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    options: Object.entries(PUNCH_LIST_PRIORITY_LABEL).map(([value, label]) => ({ value, label })),
  },
  { key: "assigned_to", label: "Assigned To", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: Object.entries(PUNCH_LIST_STATUS_LABEL).map(([value, label]) => ({ value, label })),
  },
  { key: "date_identified", label: "Date Identified", type: "date" },
  { key: "date_completed", label: "Date Completed", type: "date" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default async function PunchListPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("punch_list_items")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: true });

  const openCount = (rows ?? []).filter((r) => r.status !== "complete").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Punch list</h2>
        <span className="text-sm text-muted">{openCount} open</span>
      </div>
      <EntityTable
        fields={fields}
        rows={rows ?? []}
        projectId={params.id}
        createAction={createPunchListItem}
        updateAction={updatePunchListItem}
        deleteAction={deletePunchListItem}
        emptyLabel="No punch list items yet."
        addLabel="Add item"
      />
    </div>
  );
}
