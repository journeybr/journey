-- Tabela para guardar imagens de OG por tipo de link
CREATE TABLE IF NOT EXISTS og_images (
  key text PRIMARY KEY,
  url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE og_images ENABLE ROW LEVEL SECURITY;

-- Leitura pública (usada pelo generateMetadata server-side com anon key)
CREATE POLICY "og_images_public_read" ON og_images
  FOR SELECT USING (true);

-- Escrita apenas para usuários autenticados
CREATE POLICY "og_images_auth_write" ON og_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Linha inicial para preparação
INSERT INTO og_images (key, url) VALUES ('preparacao', null)
ON CONFLICT (key) DO NOTHING;
