-- ============================================================================
--  BayRan — adds the Punch List tab (final-walkthrough deficiency list).
--  Run this after 0001_bayran_schema.sql.
-- ============================================================================

create table if not exists public.punch_list_items (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  area             text,
  item             text not null,
  trade            text,
  priority         text not null default 'medium'
                     check (priority in ('low', 'medium', 'high')),
  assigned_to      text,
  status           text not null default 'open'
                     check (status in ('open', 'in_progress', 'complete')),
  date_identified  date,
  date_completed   date,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.punch_list_items enable row level security;

drop policy if exists "punch_list_items_all_team" on public.punch_list_items;
create policy "punch_list_items_all_team"
  on public.punch_list_items for all
  to authenticated
  using (public.is_team_member())
  with check (public.is_team_member());

create index if not exists punch_list_items_project_id_idx on public.punch_list_items(project_id);

-- Extend the dashboard rollup with an open-punch-list-items count, the same
-- way materials_pending / design_items_pending already work.
create or replace view public.project_financials
  with (security_invoker = true)
as
select
  p.id                                                       as project_id,
  p.contract_value                                           as total_contract_value,
  coalesce(co.approved_total, 0)                             as approved_change_orders,
  coalesce(co.pending_total, 0)                               as pending_change_orders,
  p.contract_value + coalesce(co.approved_total, 0)          as adjusted_contract_value,
  coalesce(pay.received_total, 0)                            as received_from_client,
  (p.contract_value + coalesce(co.approved_total, 0)) - coalesce(pay.received_total, 0)
                                                               as balance_due_from_client,
  coalesce(subs.contract_total, 0)                           as total_sub_contracts,
  coalesce(subs.paid_total, 0)                                as paid_to_subs,
  coalesce(subs.contract_total, 0) - coalesce(subs.paid_total, 0)
                                                               as balance_owed_to_subs,
  coalesce(mat.cost_total, 0)                                as materials_cost,
  coalesce(mat.charged_total, 0)                              as materials_charged_to_customer,
  coalesce(mat.charged_total, 0) - coalesce(mat.cost_total, 0)
                                                               as materials_profit,
  (p.contract_value + coalesce(co.approved_total, 0))
    - coalesce(subs.contract_total, 0) - coalesce(mat.cost_total, 0)
                                                               as est_job_margin,
  coalesce(t.total_count, 0)                                 as tasks_total,
  coalesce(t.complete_count, 0)                               as tasks_complete,
  coalesce(mat.pending_count, 0)                              as materials_pending,
  coalesce(d.pending_count, 0)                                as design_items_pending,
  coalesce(pl.open_count, 0)                                  as punch_list_open
from public.projects p
left join lateral (
  select
    count(*) filter (where status = 'complete')::int as complete_count,
    count(*)::int as total_count
  from public.tasks where project_id = p.id
) t on true
left join lateral (
  select count(*) filter (where status <> 'selected')::int as pending_count
  from public.design_selections where project_id = p.id
) d on true
left join lateral (
  select
    coalesce(sum(total_cost), 0) as cost_total,
    coalesce(sum(charged_to_customer), 0) as charged_total,
    count(*) filter (where status in ('ordered', 'backordered'))::int as pending_count
  from public.materials where project_id = p.id
) mat on true
left join lateral (
  select
    coalesce(sum(contract_amount), 0) as contract_total,
    coalesce(sum(amount_paid), 0) as paid_total
  from public.subcontractors where project_id = p.id
) subs on true
left join lateral (
  select coalesce(sum(amount_received), 0) as received_total
  from public.customer_payments where project_id = p.id
) pay on true
left join lateral (
  select
    coalesce(sum(amount) filter (where status = 'approved'), 0) as approved_total,
    coalesce(sum(amount) filter (where status = 'pending'), 0) as pending_total
  from public.change_orders where project_id = p.id
) co on true
left join lateral (
  select count(*) filter (where status <> 'complete')::int as open_count
  from public.punch_list_items where project_id = p.id
) pl on true;
