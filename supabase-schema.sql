-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA BOTINESALA SUR
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: products
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('futsal', 'sintetico', 'futbol11', 'accesorios')),
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT NULL,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);

-- =====================================================
-- TABLA: product_variants (talles y stock)
-- =====================================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20) NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar variantes por producto
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Restricción única: no puede haber dos variantes del mismo talle para un producto
CREATE UNIQUE INDEX idx_product_variants_unique ON product_variants(product_id, size);

-- =====================================================
-- TABLA: orders (pedidos)
-- =====================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_province VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20) NOT NULL,
  shipping_zone VARCHAR(20) NOT NULL CHECK (shipping_zone IN ('gba-sur', 'otro')),
  shipping_cost INTEGER NOT NULL CHECK (shipping_cost >= 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  notes TEXT DEFAULT NULL,
  mp_payment_id VARCHAR(100) DEFAULT NULL,
  mp_preference_id VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para orders
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- TABLA: order_items (items de cada pedido)
-- =====================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  product_name VARCHAR(255) NOT NULL,
  product_brand VARCHAR(100) NOT NULL,
  variant_size VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política para productos: todos pueden leer productos activos
CREATE POLICY "Productos activos visibles para todos" ON products
  FOR SELECT USING (active = true);

-- Política para variantes: todos pueden leer
CREATE POLICY "Variantes visibles para todos" ON product_variants
  FOR SELECT USING (true);

-- Para el admin, necesitarás crear políticas adicionales basadas en auth
-- Por ejemplo, para usuarios autenticados con rol admin:
-- CREATE POLICY "Admin puede todo en products" ON products
--   FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- DATOS DE EJEMPLO (opcional)
-- =====================================================

-- Insertar algunos productos de ejemplo
INSERT INTO products (name, brand, description, price, category, image_url, featured, active) VALUES
('Copa Pure.3', 'Adidas', 'Botín de fútsal con suela de goma antideslizante. Cuero sintético premium para mayor control del balón.', 89999, 'futsal', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600', true, true),
('Predator Accuracy.3', 'Adidas', 'Tecnología Grip Control para mayor precisión en los pases y tiros. Ideal para césped sintético.', 94999, 'sintetico', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', true, true),
('Mercurial Vapor 15', 'Nike', 'Diseño aerodinámico para máxima velocidad. Suela para césped sintético con excelente tracción.', 109999, 'sintetico', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', true, true),
('Future 7 Match', 'Puma', 'Ajuste adaptativo con tecnología FUZIONFIT+. Perfecto para jugadores que buscan agilidad.', 79999, 'futsal', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', false, true);

-- Obtener los IDs de los productos insertados
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT id FROM products LOOP
    -- Insertar variantes para cada producto
    INSERT INTO product_variants (product_id, size, stock) VALUES
    (product_record.id, '39', FLOOR(RANDOM() * 5)::INTEGER),
    (product_record.id, '40', FLOOR(RANDOM() * 5 + 2)::INTEGER),
    (product_record.id, '41', FLOOR(RANDOM() * 5 + 1)::INTEGER),
    (product_record.id, '42', FLOOR(RANDOM() * 5 + 3)::INTEGER),
    (product_record.id, '43', FLOOR(RANDOM() * 5 + 1)::INTEGER),
    (product_record.id, '44', FLOOR(RANDOM() * 3)::INTEGER);
  END LOOP;
END $$;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
