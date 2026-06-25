-- Coluna usada pelo template de mensagem de envio da ficha de triagem (events/page.js,
-- events/[id]/page.js) — já existia no código, mas nunca foi criada no banco.
alter table events add column if not exists ficha_message text;
