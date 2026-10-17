// Firestore CRUD helpers for projects and their per-project subcollections.
// Firestore has no generated/computed columns, so every "auto-calculated"
// field (totals, balances, profit, floor area) is computed here, once, right
// before every write — the same values every call site reads back.
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function num(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

// ---------------------------------------------------------------------------
// Form field -> clean document field, per entity. Pulled out of each page so
// create/update always normalize the same way.
// ---------------------------------------------------------------------------
export const ENTITY_FIELDS = {
  tasks: (f) => ({
    title: str(f.title) ?? "Untitled task",
    category: str(f.category),
    assigned_to: str(f.assigned_to),
    start_date: str(f.start_date),
    due_date: str(f.due_date),
    status: str(f.status) ?? "not_started",
    notes: str(f.notes),
  }),
  design_selections: (f) => ({
    area: str(f.area),
    item: str(f.item) ?? "Untitled selection",
    description: str(f.description),
    status: str(f.status) ?? "not_selected",
    selected_by: str(f.selected_by),
    date_selected: str(f.date_selected),
    notes: str(f.notes),
  }),
  room_measurements: (f) => {
    const width_ft = num(f.width_ft) ?? 0;
    const length_ft = num(f.length_ft) ?? 0;
    const height_ft = num(f.height_ft) ?? 0;
    const perimeter_lf = 2 * (width_ft + length_ft);
    return {
      area: str(f.area) ?? "Untitled area",
      width_ft: num(f.width_ft),
      length_ft: num(f.length_ft),
      height_ft: num(f.height_ft),
      floor_sqft: width_ft * length_ft,
      perimeter_lf,
      wall_sqft: perimeter_lf * height_ft,
      notes: str(f.notes),
    };
  },
  materials: (f) => {
    const qty = num(f.qty) ?? 0;
    const unit_cost = num(f.unit_cost) ?? 0;
    const charged_to_customer = num(f.charged_to_customer) ?? 0;
    const total_cost = qty * unit_cost;
    return {
      area: str(f.area),
      material: str(f.material) ?? "Untitled material",
      vendor: str(f.vendor),
      qty: num(f.qty),
      unit: str(f.unit),
      unit_cost: num(f.unit_cost),
      total_cost,
      status: str(f.status) ?? "needed",
      order_date: str(f.order_date),
      po_number: str(f.po_number),
      charged_to_customer,
      materials_profit: charged_to_customer - total_cost,
      notes: str(f.notes),
    };
  },
  subcontractors: (f) => {
    const contract_amount = num(f.contract_amount) ?? 0;
    const amount_paid = num(f.amount_paid) ?? 0;
    return {
      trade: str(f.trade),
      company: str(f.company) ?? "Untitled sub",
      contact: str(f.contact),
      contract_amount,
      amount_paid,
      balance_due: contract_amount - amount_paid,
      last_payment_date: str(f.last_payment_date),
      status: str(f.status) ?? "not_started",
      notes: str(f.notes),
    };
  },
  customer_payments: (f) => {
    const amount_due = num(f.amount_due) ?? 0;
    const amount_received = num(f.amount_received) ?? 0;
    return {
      payment_number: num(f.payment_number),
      description: str(f.description),
      amount_due,
      amount_received,
      balance_remaining: amount_due - amount_received,
      date_received: str(f.date_received),
      payment_method: str(f.payment_method),
      status: str(f.status) ?? "pending",
      notes: str(f.notes),
    };
  },
  change_orders: (f) => {
    const amount = num(f.amount) ?? 0;
    const amount_received = num(f.amount_received) ?? 0;
    return {
      co_number: num(f.co_number),
      description: str(f.description) ?? "Untitled change order",
      date_submitted: str(f.date_submitted),
      date_approved: str(f.date_approved),
      amount,
      status: str(f.status) ?? "pending",
      amount_received,
      balance_remaining: amount - amount_received,
      notes: str(f.notes),
    };
  },
  trade_scope: (f) => ({
    trade: str(f.trade) ?? "Untitled trade",
    scope_item: str(f.scope_item),
    description: str(f.description),
    status: str(f.status) ?? "not_started",
    assigned_sub: str(f.assigned_sub),
    start_date: str(f.start_date),
    complete_date: str(f.complete_date),
    notes: str(f.notes),
  }),
  punch_list_items: (f) => ({
    area: str(f.area),
    item: str(f.item) ?? "Untitled item",
    trade: str(f.trade),
    priority: str(f.priority) ?? "medium",
    assigned_to: str(f.assigned_to),
    status: str(f.status) ?? "open",
    date_identified: str(f.date_identified),
    date_completed: str(f.date_completed),
    notes: str(f.notes),
  }),
};

export async function listSubcollection(projectId, name) {
  const snap = await getDocs(collection(db, "projects", projectId, name));
  return snap.docs.map((d) => ({ id: d.id, project_id: projectId, ...d.data() }));
}

export async function createSubdoc(projectId, name, formFields) {
  const data = ENTITY_FIELDS[name](formFields);
  data.created_at = serverTimestamp();
  await addDoc(collection(db, "projects", projectId, name), data);
}

export async function updateSubdoc(projectId, name, id, formFields) {
  const data = ENTITY_FIELDS[name](formFields);
  await updateDoc(doc(db, "projects", projectId, name, id), data);
}

export async function deleteSubdoc(projectId, name, id) {
  await deleteDoc(doc(db, "projects", projectId, name, id));
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export async function listProjects() {
  const snap = await getDocs(query(collection(db, "projects"), orderBy("created_at", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProject(id) {
  const snap = await getDoc(doc(db, "projects", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createProject(formFields, user) {
  const data = {
    name: str(formFields.name),
    client_name: str(formFields.client_name),
    client_email: str(formFields.client_email),
    client_phone: str(formFields.client_phone),
    address: str(formFields.address),
    project_type: str(formFields.project_type),
    roc_number: str(formFields.roc_number),
    status: str(formFields.status) ?? "active",
    start_date: str(formFields.start_date),
    target_completion_date: str(formFields.target_completion_date),
    contract_value: num(formFields.contract_value) ?? 0,
    pm_id: user.uid,
    created_by: user.uid,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "projects"), data);
  return ref.id;
}

export async function updateProject(id, formFields) {
  await updateDoc(doc(db, "projects", id), {
    name: str(formFields.name),
    client_name: str(formFields.client_name),
    client_email: str(formFields.client_email),
    client_phone: str(formFields.client_phone),
    address: str(formFields.address),
    project_type: str(formFields.project_type),
    roc_number: str(formFields.roc_number),
    status: str(formFields.status) ?? "active",
    start_date: str(formFields.start_date),
    target_completion_date: str(formFields.target_completion_date),
    contract_value: num(formFields.contract_value) ?? 0,
    updated_at: serverTimestamp(),
  });
}

export async function deleteProject(id) {
  // Firestore doesn't cascade-delete subcollections — clear each one first
  // so a deleted project doesn't leave orphaned data behind.
  const subcollections = [
    "tasks",
    "design_selections",
    "room_measurements",
    "materials",
    "subcontractors",
    "customer_payments",
    "change_orders",
    "trade_scope",
    "punch_list_items",
  ];
  for (const name of subcollections) {
    const snap = await getDocs(collection(db, "projects", id, name));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, "projects", id));
}
