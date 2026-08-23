-- =====================================================
-- MIGRACIÓN: costos de envío editables desde el panel
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

CREATE TABLE IF NOT EXISTS shipping_zones (
  -- El slug coincide con orders.shipping_zone, que tiene un CHECK
  -- con ('gba-sur', 'otro'): por eso las zonas se editan, no se crean.
  slug VARCHAR(20) PRIMARY KEY,
  label VARCHAR(80) NOT NULL,
  description VARCHAR(160) DEFAULT NULL,
  cost INTEGER NOT NULL CHECK (cost >= 0),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores actuales, los que hoy están escritos en el código
INSERT INTO shipping_zones (slug, label, description, cost, sort_order)
VALUES
  ('gba-sur', 'GBA Sur', 'Llavallol, Lanús, Lomas y alrededores. Envío en moto.', 2500, 1),
  ('otro',    'Todo el país', 'Envío por correo al resto de Argentina.', 5500, 2)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- La tienda necesita leer los costos sin sesión
DROP POLICY IF EXISTS "Shipping zones are viewable by everyone" ON shipping_zones;
CREATE POLICY "Shipping zones are viewable by everyone" ON shipping_zones
  FOR SELECT USING (true);

-- Las escrituras van con la service role key, desde el panel
DROP POLICY IF EXISTS "Service role can update shipping zones" ON shipping_zones;
CREATE POLICY "Service role can update shipping zones" ON shipping_zones
  FOR UPDATE USING (true);

-- =====================================================
-- FIN
-- =====================================================
