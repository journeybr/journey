-- Biblioteca de textos de preparação reutilizáveis.
-- Cada cerimônia pode apontar para um texto via events.preparation_id.
create table if not exists preparation_texts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null default '',
  created_at  timestamptz default now()
);

-- Acesso de leitura pública (página /preparacao/[id] é aberta, sem login)
alter table preparation_texts enable row level security;
create policy "leitura pública" on preparation_texts for select using (true);
create policy "escrita autenticada" on preparation_texts for all using (auth.role() = 'authenticated');

-- Liga cerimônia → texto de preparação
alter table events add column if not exists preparation_id uuid references preparation_texts(id) on delete set null;
