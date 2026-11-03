-- =====================================================
-- MIGRACIÓN: ofertas
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Precio "antes" de un producto en oferta. Si está cargado y es mayor que
-- el precio actual, el botín aparece en /ofertas con el precio viejo
-- tachado y el porcentaje de descuento. Vacío = no está en oferta.
-- Lo que se cobra sigue siendo siempre `price`.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS compare_price DECIMAL(10, 2);

-- =====================================================
-- FIN
-- =====================================================
