-- Adiciona chaves para os outros tipos de link
INSERT INTO og_images (key, url) VALUES
  ('inscricao', null),
  ('pagamento', null),
  ('ficha', null)
ON CONFLICT (key) DO NOTHING;
