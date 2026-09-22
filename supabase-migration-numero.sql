-- =====================================================
-- MIGRACIÓN: número de pedido corto
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- El cliente ve "#1043" en el mail, en la pantalla de compra y en el panel.
-- El código largo (BOTS-…) sigue existiendo por dentro: es la referencia
-- que viaja a MercadoPago. Arranca en 1001 para que el primer pedido no
-- diga "#1".

CREATE SEQUENCE IF NOT EXISTS orders_numero_seq START 1001;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS numero INTEGER;

-- Los pedidos que ya existen se numeran por fecha
UPDATE orders o
SET numero = s.n
FROM (
  SELECT id, 1000 + row_number() OVER (ORDER BY created_at, id) AS n
  FROM orders
  WHERE numero IS NULL
) s
WHERE o.id = s.id;

SELECT setval('orders_numero_seq', GREATEST((SELECT COALESCE(MAX(numero), 1000) FROM orders), 1000));

ALTER TABLE orders ALTER COLUMN numero SET DEFAULT nextval('orders_numero_seq');
ALTER TABLE orders ALTER COLUMN numero SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_numero ON orders(numero);

-- =====================================================
-- FIN
-- =====================================================
