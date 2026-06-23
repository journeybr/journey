-- Transferência de responsabilidade de pagamento entre contatos.
-- from_contact_id: pessoa da cerimônia cujo valor é reduzido.
-- to_contact_id: pessoa cadastrada (participante ou não) que assume o valor.
create table if not exists payment_transfers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_id uuid references events(id) on delete cascade not null,
  from_contact_id uuid references contacts(id) on delete cascade not null,
  to_contact_id uuid references contacts(id) on delete cascade not null,
  amount numeric not null,
  status text default 'pendente', -- 'pendente' | 'conferir pagamento' | 'pago'
  payment_method text,
  payment_date date,
  comprovante_url text,
  observation text,
  created_by text,
  cancelled boolean default false,
  log jsonb default '[]'::jsonb
);

alter table payment_transfers enable row level security;

drop policy if exists "Allow all actions for authenticated users on payment_transfers" on payment_transfers;
create policy "Allow all actions for authenticated users on payment_transfers"
on payment_transfers for all to authenticated using (true) with check (true);

-- O link público de pagamento (anônimo) precisa ler e atualizar suas próprias transferências.
drop policy if exists "Allow public read payment_transfers" on payment_transfers;
create policy "Allow public read payment_transfers"
on payment_transfers for select to anon using (true);

drop policy if exists "Allow public update payment_transfers" on payment_transfers;
create policy "Allow public update payment_transfers"
on payment_transfers for update to anon using (true) with check (true);
