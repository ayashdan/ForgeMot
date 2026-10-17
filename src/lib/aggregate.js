// Client-side equivalents of the old Postgres project_financials view and
// action-items query — Firestore has no server-side joins/views, so every
// project's financial summary is computed here by reading its subcollections
// and reducing them, the same math the SQL view used to do.
import { listProjects, listSubcollection } from "./data";

function emptyFinancials(projectId, contractValue) {
  return {
    project_id: projectId,
    total_contract_value: contractValue,
    approved_change_orders: 0,
    pending_change_orders: 0,
    adjusted_contract_value: contractValue,
    received_from_client: 0,
    balance_due_from_client: contractValue,
    total_sub_contracts: 0,
    paid_to_subs: 0,
    balance_owed_to_subs: 0,
    materials_cost: 0,
    materials_charged_to_customer: 0,
    materials_profit: 0,
    est_job_margin: contractValue,
    tasks_total: 0,
    tasks_complete: 0,
    materials_pending: 0,
    design_items_pending: 0,
    punch_list_open: 0,
  };
}

const sum = (rows, key) => rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export async function getProjectFinancials(project) {
  const [tasks, designs, materials, subs, payments, changeOrders, punchList] = await Promise.all([
    listSubcollection(project.id, "tasks"),
    listSubcollection(project.id, "design_selections"),
    listSubcollection(project.id, "materials"),
    listSubcollection(project.id, "subcontractors"),
    listSubcollection(project.id, "customer_payments"),
    listSubcollection(project.id, "change_orders"),
    listSubcollection(project.id, "punch_list_items"),
  ]);

  const contractValue = Number(project.contract_value) || 0;
  const approvedChangeOrders = sum(
    changeOrders.filter((c) => c.status === "approved"),
    "amount"
  );
  const pendingChangeOrders = sum(
    changeOrders.filter((c) => c.status === "pending"),
    "amount"
  );
  const adjustedContractValue = contractValue + approvedChangeOrders;
  const receivedFromClient = sum(payments, "amount_received");
  const totalSubContracts = sum(subs, "contract_amount");
  const paidToSubs = sum(subs, "amount_paid");
  const materialsCost = sum(materials, "total_cost");
  const materialsCharged = sum(materials, "charged_to_customer");

  return {
    project_id: project.id,
    total_contract_value: contractValue,
    approved_change_orders: approvedChangeOrders,
    pending_change_orders: pendingChangeOrders,
    adjusted_contract_value: adjustedContractValue,
    received_from_client: receivedFromClient,
    balance_due_from_client: adjustedContractValue - receivedFromClient,
    total_sub_contracts: totalSubContracts,
    paid_to_subs: paidToSubs,
    balance_owed_to_subs: totalSubContracts - paidToSubs,
    materials_cost: materialsCost,
    materials_charged_to_customer: materialsCharged,
    materials_profit: materialsCharged - materialsCost,
    est_job_margin: adjustedContractValue - totalSubContracts - materialsCost,
    tasks_total: tasks.length,
    tasks_complete: tasks.filter((t) => t.status === "complete").length,
    materials_pending: materials.filter((m) => ["ordered", "backordered"].includes(m.status))
      .length,
    design_items_pending: designs.filter((d) => d.status !== "selected").length,
    punch_list_open: punchList.filter((p) => p.status !== "complete").length,
  };
}

export async function getProjectWithFinancials(id, project) {
  const financials = await getProjectFinancials(project);
  return { ...project, id, financials };
}

export async function getProjectsWithFinancials() {
  const projects = await listProjects();
  const withFinancials = await Promise.all(
    projects.map(async (p) => ({
      ...p,
      financials: await getProjectFinancials(p).catch(() =>
        emptyFinancials(p.id, Number(p.contract_value) || 0)
      ),
    }))
  );
  return withFinancials;
}

const ACTION_TYPE = {
  OVERDUE_TASK: "overdue_task",
  UPCOMING_TASK: "upcoming_task",
  PENDING_CHANGE_ORDER: "pending_change_order",
  BACKORDERED_MATERIAL: "backordered_material",
  PENDING_DESIGN: "pending_design",
  PUNCH_LIST_ITEM: "punch_list_item",
};

// Pulls every open-item signal across active projects into one prioritized
// list for the main dashboard: overdue/upcoming tasks, pending change order
// approvals, backordered materials, unmade design selections, and open
// punch list items.
export async function getActionItems() {
  const allProjects = await listProjects();
  const activeProjects = allProjects.filter((p) => ["active", "on_hold"].includes(p.status));
  if (activeProjects.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const weekOut = new Date(today.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);

  const items = [];

  await Promise.all(
    activeProjects.map(async (project) => {
      const [tasks, changeOrders, materials, designs, punchList] = await Promise.all([
        listSubcollection(project.id, "tasks"),
        listSubcollection(project.id, "change_orders"),
        listSubcollection(project.id, "materials"),
        listSubcollection(project.id, "design_selections"),
        listSubcollection(project.id, "punch_list_items"),
      ]);

      for (const t of tasks) {
        if (t.status === "complete" || !t.due_date) continue;
        const overdue = t.due_date < todayStr;
        const upcoming = !overdue && t.due_date <= weekOut;
        if (!overdue && !upcoming) continue;
        items.push({
          type: overdue ? ACTION_TYPE.OVERDUE_TASK : ACTION_TYPE.UPCOMING_TASK,
          severity: overdue ? "high" : "medium",
          title: t.title,
          projectId: project.id,
          projectName: project.name,
          detail: overdue ? `Overdue since ${t.due_date}` : `Due ${t.due_date}`,
          href: `/projects/${project.id}/tasks`,
        });
      }

      for (const co of changeOrders) {
        if (co.status !== "pending") continue;
        items.push({
          type: ACTION_TYPE.PENDING_CHANGE_ORDER,
          severity: "medium",
          title: co.description,
          projectId: project.id,
          projectName: project.name,
          detail: `Awaiting approval — $${Number(co.amount).toLocaleString("en-US")}`,
          href: `/projects/${project.id}/change-orders`,
        });
      }

      for (const m of materials) {
        if (!["backordered", "ordered"].includes(m.status)) continue;
        items.push({
          type: ACTION_TYPE.BACKORDERED_MATERIAL,
          severity: m.status === "backordered" ? "high" : "low",
          title: m.material,
          projectId: project.id,
          projectName: project.name,
          detail: m.status === "backordered" ? "Backordered" : "Ordered, not yet delivered",
          href: `/projects/${project.id}/materials`,
        });
      }

      for (const d of designs) {
        if (d.status !== "not_selected") continue;
        items.push({
          type: ACTION_TYPE.PENDING_DESIGN,
          severity: "low",
          title: d.item,
          projectId: project.id,
          projectName: project.name,
          detail: d.area ? `${d.area} — selection needed` : "Selection needed",
          href: `/projects/${project.id}/design`,
        });
      }

      for (const p of punchList) {
        if (p.status === "complete") continue;
        items.push({
          type: ACTION_TYPE.PUNCH_LIST_ITEM,
          severity: p.priority === "high" ? "high" : p.priority === "medium" ? "medium" : "low",
          title: p.item,
          projectId: project.id,
          projectName: project.name,
          detail: p.area ? `${p.area} — punch list` : "Punch list",
          href: `/projects/${project.id}/punch-list`,
        });
      }
    })
  );

  const severityRank = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
