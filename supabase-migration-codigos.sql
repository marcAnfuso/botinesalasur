-- =====================================================
-- MIGRACIÓN: código corto por producto
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Cada producto recibe un número correlativo (1, 2, 3…) que se muestra como
-- #0001, #0002… en la tienda, el panel, los pedidos y los mails. Sirve para
-- ubicar el par en el depósito sin buscar por nombre de modelo. Se asigna
-- solo al crear el producto y no cambia nunca.
--
-- Al agregar la columna, Postgres numera los productos que ya existen.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS codigo SERIAL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_codigo ON products(codigo);

-- El pedido guarda el código tal como estaba al comprar, igual que guarda el
-- nombre y el precio: si después el producto cambia, el pedido no.
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_code INTEGER;

-- Los pedidos anteriores a esta migración toman el código actual del producto.
UPDATE order_items oi
SET product_code = p.codigo
FROM products p
WHERE oi.product_id = p.id AND oi.product_code IS NULL;

-- =====================================================
-- FIN
-- =====================================================
