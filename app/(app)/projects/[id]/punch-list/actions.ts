"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function revalidateProject(projectId: string) {
  revalidatePath(`/projects/${projectId}/punch-list`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function createPunchListItem(formData: FormData) {
  const supabase = createClient();
  const project_id = String(formData.get("project_id") || "");
  if (!project_id) return;

  await supabase.from("punch_list_items").insert({
    project_id,
    area: str(formData, "area"),
    item: str(formData, "item") ?? "Untitled item",
    trade: str(formData, "trade"),
    priority: str(formData, "priority") ?? "medium",
    assigned_to: str(formData, "assigned_to"),
    status: str(formData, "status") ?? "open",
    date_identified: str(formData, "date_identified"),
    date_completed: str(formData, "date_completed"),
    notes: str(formData, "notes"),
  });

  revalidateProject(project_id);
}

export async function updatePunchListItem(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const { data } = await supabase
    .from("punch_list_items")
    .update({
      area: str(formData, "area"),
      item: str(formData, "item") ?? "Untitled item",
      trade: str(formData, "trade"),
      priority: str(formData, "priority") ?? "medium",
      assigned_to: str(formData, "assigned_to"),
      status: str(formData, "status") ?? "open",
      date_identified: str(formData, "date_identified"),
      date_completed: str(formData, "date_completed"),
      notes: str(formData, "notes"),
    })
    .eq("id", id)
    .select("project_id")
    .single();

  if (data) revalidateProject(data.project_id);
}

export async function deletePunchListItem(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const { data } = await supabase
    .from("punch_list_items")
    .select("project_id")
    .eq("id", id)
    .single();
  await supabase.from("punch_list_items").delete().eq("id", id);
  if (data) revalidateProject(data.project_id);
}
