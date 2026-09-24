-- =====================================================
-- MIGRACIÓN: pedidos sólo visibles para el servidor
-- Ejecutar en el SQL Editor de Supabase — ANTES de abrir la tienda al público
-- =====================================================

-- La migración de MercadoPago creó políticas "para la service role" con
-- USING (true). La service role saltea RLS y no las necesita; lo que hacían
-- en la práctica era abrirle orders y order_items a cualquiera con la clave
-- pública (que viaja en el navegador): nombres, mails, DNI, direcciones.
-- Se eliminan. Todo acceso a pedidos pasa por las rutas del servidor.

DROP POLICY IF EXISTS "Service role can insert orders" ON orders;
DROP POLICY IF EXISTS "Service role can update orders" ON orders;
DROP POLICY IF EXISTS "Service role can select orders" ON orders;
DROP POLICY IF EXISTS "Service role can all on order_items" ON order_items;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Verificación (debe devolver 0 filas): no queda ninguna política sobre pedidos
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('orders', 'order_items');

-- =====================================================
-- FIN
-- =====================================================
