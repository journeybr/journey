-- Marca quando a pessoa manifestou interesse pelo link público (interesse/[id]), antes de ser
-- movida para "Participantes Ativos" (events/[id]/page.js) — null significa que já está nos ativos.
alter table event_participants add column if not exists interested_at timestamptz;
