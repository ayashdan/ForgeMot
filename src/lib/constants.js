// Status/priority enums and their display labels, used across the project
// tabs and the EntityTable select fields.

export const PROJECT_STATUS_LABEL = {
  active: "Active",
  on_hold: "On Hold",
  complete: "Complete",
  cancelled: "Cancelled",
};

export const TASK_STATUS_LABEL = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
  blocked: "Blocked",
};

export const DESIGN_STATUS_LABEL = {
  not_selected: "Not Selected",
  selected: "Selected",
  ordered: "Ordered",
  received: "Received",
};

export const MATERIAL_STATUS_LABEL = {
  needed: "Needed",
  ordered: "Ordered",
  backordered: "Backordered",
  delivered: "Delivered",
  installed: "Installed",
};

export const SUB_STATUS_LABEL = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
};

export const PAYMENT_STATUS_LABEL = {
  pending: "Pending",
  invoiced: "Invoiced",
  paid: "Paid",
};

export const CHANGE_ORDER_STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const TRADE_SCOPE_STATUS_LABEL = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
};

export const PUNCH_LIST_STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  complete: "Complete",
};

export const PUNCH_LIST_PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function toOptions(labelMap) {
  return Object.entries(labelMap).map(([value, label]) => ({ value, label }));
}
