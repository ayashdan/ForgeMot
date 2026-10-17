import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate, formatNumber, toDateInputValue } from "../lib/format";

function displayValue(field, row) {
  const value = row[field.key];
  if (field.type === "currency") return formatCurrency(Number(value ?? 0));
  if (field.type === "number")
    return value == null || value === "" ? "—" : formatNumber(Number(value), 2);
  if (field.type === "date") return formatDate(value);
  if (field.type === "select") {
    const opt = field.options?.find((o) => o.value === value);
    return opt?.label ?? String(value ?? "—");
  }
  return value ? String(value) : "—";
}

function emptyDraft(fields) {
  const draft = {};
  for (const f of fields) {
    if (f.readOnly) continue;
    draft[f.key] = f.type === "select" ? f.options?.[0]?.value ?? "" : "";
  }
  return draft;
}

function rowToDraft(fields, row) {
  const draft = {};
  for (const f of fields) {
    if (f.readOnly) continue;
    draft[f.key] = f.type === "date" ? toDateInputValue(row[f.key]) : row[f.key] ?? "";
  }
  return draft;
}

function EditableCell({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[8rem] rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm outline-none focus:border-brand"
      >
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder={field.placeholder}
        className="w-full min-w-[10rem] resize-y rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm outline-none focus:border-brand"
      />
    );
  }
  const inputType = field.type === "currency" || field.type === "number" ? "number" : field.type;
  return (
    <input
      type={inputType}
      step={field.type === "currency" || field.type === "number" ? "any" : undefined}
      required={field.required}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-[7rem] rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm outline-none focus:border-brand"
    />
  );
}

export default function EntityTable({
  fields,
  rows,
  onCreate,
  onUpdate,
  onDelete,
  emptyLabel = "Nothing here yet.",
  addLabel = "Add row",
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState(() => emptyDraft(fields));
  const [busy, setBusy] = useState(false);

  function startEdit(row) {
    setEditingId(row.id);
    setEditDraft(rowToDraft(fields, row));
  }

  async function saveEdit(id) {
    setBusy(true);
    try {
      await onUpdate(id, editDraft);
      setEditingId(null);
      setEditDraft(null);
    } finally {
      setBusy(false);
    }
  }

  async function saveAdd() {
    setBusy(true);
    try {
      await onCreate(addDraft);
      setAddDraft(emptyDraft(fields));
      setAdding(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this row?")) return;
    setBusy(true);
    try {
      await onDelete(id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface2/60">
            {fields.map((f) => (
              <th
                key={f.key}
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {f.label}
              </th>
            ))}
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && !adding && (
            <tr>
              <td colSpan={fields.length + 1} className="px-3 py-6 text-center text-sm text-muted">
                {emptyLabel}
              </td>
            </tr>
          )}

          {rows.map((row) => {
            const editing = editingId === row.id;
            return (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-surface2/30">
                {fields.map((field) => (
                  <td key={field.key} className="px-3 py-2 align-top">
                    {editing && !field.readOnly ? (
                      <EditableCell
                        field={field}
                        value={editDraft[field.key] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, [field.key]: v }))}
                      />
                    ) : field.type === "select" ? (
                      <StatusBadge status={String(row[field.key])} label={displayValue(field, row)} />
                    ) : (
                      <span className={field.readOnly ? "text-muted" : ""}>
                        {displayValue(field, row)}
                      </span>
                    )}
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-2 text-right align-top">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => saveEdit(row.id)}
                        className="press rounded-md px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/10 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                        className="press rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-surface2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="press rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-surface2 hover:text-fg"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(row.id)}
                        className="press rounded-md px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}

          {adding && (
            <tr className="border-b border-line bg-surface2/20 last:border-0">
              {fields.map((field) => (
                <td key={field.key} className="px-3 py-2 align-top">
                  {field.readOnly ? (
                    <span className="text-xs text-muted">auto</span>
                  ) : (
                    <EditableCell
                      field={field}
                      value={addDraft[field.key] ?? ""}
                      onChange={(v) => setAddDraft((d) => ({ ...d, [field.key]: v }))}
                    />
                  )}
                </td>
              ))}
              <td className="whitespace-nowrap px-3 py-2 text-right align-top">
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveAdd}
                  className="press rounded-md px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/10 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setAddDraft(emptyDraft(fields));
                  }}
                  className="press rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-surface2"
                >
                  Cancel
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {!adding && (
        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="press rounded-md px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/10"
          >
            + {addLabel}
          </button>
        </div>
      )}
    </div>
  );
}
