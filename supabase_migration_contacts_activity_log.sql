-- Log de atividades do contato que precisam sobreviver à exclusão da linha em
-- event_participants (ex: remoção de uma cerimônia). Cada entrada carrega seu
-- próprio eventId/eventName, já que a linha de origem pode não existir mais.
alter table contacts add column if not exists activity_log jsonb default '[]'::jsonb;
