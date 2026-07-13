ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
