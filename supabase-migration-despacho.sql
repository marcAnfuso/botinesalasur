-- =====================================================
-- MIGRACIÓN: datos que pide Correo Argentino para despachar
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Correo pide DNI del destinatario y piso/departamento aparte de la calle.
-- Sin estos dos datos los chicos tenían que perseguir al cliente por
-- WhatsApp antes de poder generar el envío.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_dni VARCHAR(20);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_floor_apt VARCHAR(60);

-- =====================================================
-- FIN
-- =====================================================
