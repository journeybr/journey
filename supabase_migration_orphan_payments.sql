-- Pagamentos registrados para recebedores órfãos (ex: Pedro Ivo, que recebe
-- transferências de vários participantes mas não está matriculado em nenhuma cerimônia).
-- Em vez de marcar cada transferência individualmente como 'pago', registramos
-- aqui o montante total pago de uma vez. O status de todos os sub-pagantes passa
-- para 'pago' quando SUM(orphan_payments) >= SUM(transferências recebidas).

CREATE TABLE IF NOT EXISTS orphan_payments (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id   UUID        NOT NULL REFERENCES contacts(id),
  amount       DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE,
  method       TEXT,
  cancelled    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
