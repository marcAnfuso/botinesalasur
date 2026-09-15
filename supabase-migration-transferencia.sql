-- =====================================================
-- MIGRACIÓN: precio por transferencia
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Precio con descuento pagando por transferencia o efectivo. Lo cargan los
-- chicos producto por producto (son valores exactos, no un porcentaje).
-- Si está vacío, el producto no ofrece precio por transferencia.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS transfer_price DECIMAL(10, 2);

-- =====================================================
-- FIN
-- =====================================================
