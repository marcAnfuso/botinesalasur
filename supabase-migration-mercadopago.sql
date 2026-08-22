-- =====================================================
-- MIGRACIÓN: Soporte para MercadoPago
-- Ejecutar en Supabase SQL Editor después del esquema inicial
-- =====================================================

-- Agregar columnas faltantes en orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS external_reference VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mp_payment_data JSONB DEFAULT NULL;

-- Crear índice para external_reference
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_external_reference
  ON orders(external_reference) WHERE external_reference IS NOT NULL;

-- Actualizar el CHECK constraint de status en orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Modificar order_items para que coincida con la API
-- Agregar columna size si no existe (antes era variant_size)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'size') THEN
    ALTER TABLE order_items ADD COLUMN size VARCHAR(20);
  END IF;
END $$;

-- Copiar datos de variant_size a size si existe
UPDATE order_items SET size = variant_size WHERE size IS NULL AND variant_size IS NOT NULL;

-- Agregar total_price si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'total_price') THEN
    ALTER TABLE order_items ADD COLUMN total_price INTEGER DEFAULT 0;
  END IF;
END $$;

-- Función para decrementar stock (usada por el webhook)
CREATE OR REPLACE FUNCTION decrement_stock(variant_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(0, stock - qty)
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para que el service role pueda manejar orders
-- Eliminamos si existen y las volvemos a crear

DROP POLICY IF EXISTS "Service role can insert orders" ON orders;
DROP POLICY IF EXISTS "Service role can update orders" ON orders;
DROP POLICY IF EXISTS "Service role can select orders" ON orders;
DROP POLICY IF EXISTS "Service role can all on order_items" ON order_items;

CREATE POLICY "Service role can insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE
  USING (true);

CREATE POLICY "Service role can select orders" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can all on order_items" ON order_items
  FOR ALL
  USING (true);

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
