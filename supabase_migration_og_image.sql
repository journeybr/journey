-- Add og_image_url to preparation_texts
ALTER TABLE preparation_texts ADD COLUMN IF NOT EXISTS og_image_url text;
