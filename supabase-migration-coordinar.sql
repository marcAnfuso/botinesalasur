-- =====================================================
-- MIGRACIÓN: envío "a coordinar con el vendedor"
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- El cliente puede elegir no pagar el envío en la web y arreglarlo por
-- WhatsApp (moto en el día, retiro, etc.). Es una zona más del selector,
-- con costo 0: el envío se cobra aparte, al coordinar.

-- El CHECK fijaba las zonas en ('gba-sur', 'otro') y obligaba a una
-- migración por cada zona nueva. Se quita: los valores válidos son los
-- de la tabla shipping_zones, que es quien manda desde el panel.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_zone_check;

INSERT INTO shipping_zones (slug, label, description, cost, sort_order)
VALUES (
  'coordinar',
  'A coordinar con el vendedor',
  'No pagás el envío acá: te escribimos por WhatsApp y lo arreglamos (moto en el día, retiro, correo).',
  0,
  3
)
ON CONFLICT (slug) DO NOTHING;

-- Alta de zonas desde la service role (hasta ahora sólo había UPDATE)
DROP POLICY IF EXISTS "Service role can insert shipping zones" ON shipping_zones;
CREATE POLICY "Service role can insert shipping zones" ON shipping_zones
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FIN
-- =====================================================
