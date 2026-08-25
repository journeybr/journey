-- Datas de cerimônia lançadas manualmente (para eventos anteriores ao sistema)
-- Só aparece na tela de Pessoas; não gera pagamento nem enrollment.

CREATE TABLE IF NOT EXISTS contact_manual_dates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_manual_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions for authenticated users on contact_manual_dates"
ON contact_manual_dates FOR ALL TO authenticated USING (true) WITH CHECK (true);
