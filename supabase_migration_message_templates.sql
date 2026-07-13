CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_templates_public_read" ON message_templates
  FOR SELECT USING (true);

CREATE POLICY "message_templates_auth_write" ON message_templates
  FOR ALL USING (auth.role() = 'authenticated');
