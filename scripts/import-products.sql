-- =====================================================
-- IMPORTACIÓN DE PRODUCTOS DESDE EXCEL
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Primero limpiar los productos de ejemplo
DELETE FROM product_variants;
DELETE FROM products;

-- Producto 1: LUNAR GATO BLANCO Y VERDE
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO BLANCO Y VERDE', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '22,5 CM (niño)', 1);
END $$;

-- Producto 2: LUNAR GATO BLANCO SUELA ROJA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO BLANCO SUELA ROJA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', true, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '22,5 CM(niño)', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 0);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 3: LUNAR GATO BLANCO SUELA NARANJA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO BLANCO SUELA NARANJA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '22,5 CM (niño)', 1);
END $$;

-- Producto 4: STREET GATO NEGRO NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO NEGRO NEGRO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '4US', 0);
END $$;

-- Producto 5: PREMIER SUELA DE COLORES NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PREMIER SUELA DE COLORES NEGRO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '5.5US', 0);
END $$;

-- Producto 6: STREET GATO SUELA AZUL
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO SUELA AZUL', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '6.5US', 0);
END $$;

-- Producto 7: ADIZERO NARANJA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('ADIZERO NARANJA', 'Adidas', 'Botín Adidas para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/nike-2.jpg', true, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '6.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
END $$;

-- Producto 8: STREET GATO NEGRO Y VIOLETA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO NEGRO Y VIOLETA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '6.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '11US', 1);
END $$;

-- Producto 9: STREET GATO BLANCO PIPETA AZUL
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO BLANCO PIPETA AZUL', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '6.5US', 1);
END $$;

-- Producto 10: PHANTOM NARANJA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM NARANJA', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/fg-1.jpg', true, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '6.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '11US', 1);
END $$;

-- Producto 11: TIEMPO LEGEND NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO LEGEND NEGRO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '6,5US', 1);
END $$;

-- Producto 12: STREET GATO GRIS Y BLANCO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO GRIS Y BLANCO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 0);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 0);
END $$;

-- Producto 13: GATO SUPRIME SB ROJO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('GATO SUPRIME SB ROJO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
END $$;

-- Producto 14: STREET GATO ROJO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO ROJO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
END $$;

-- Producto 15: TIEMPO FLUOR
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO FLUOR', 'Nike', 'Botín Nike para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
END $$;

-- Producto 16: TIEMPO CELESTE
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO CELESTE', 'Nike', 'Botín Nike para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/nike-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 1);
END $$;

-- Producto 17: COPA NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('COPA NEGRO', 'Adidas', 'Botín Adidas para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', true, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 0);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '11US', 1);
END $$;

-- Producto 18: PREMIER VERDE PIPETA BLANCA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PREMIER VERDE PIPETA BLANCA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 2);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 19: STREET GATO NEGRO SUELA BLANCA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO NEGRO SUELA BLANCA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
END $$;

-- Producto 20: COPA ROJO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('COPA ROJO', 'Adidas', 'Botín Adidas para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '11US', 1);
END $$;

-- Producto 21: AIR ZOOM BLANCO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('AIR ZOOM BLANCO', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/futsal-1.jpg', true, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '7US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 22: LUNAR GATO VERDES FLUOR
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO VERDES FLUOR', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '25cm', 0);
END $$;

-- Producto 23: LUNAR GATO NEGRO Y VIOLETA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO NEGRO Y VIOLETA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '25cm', 0);
END $$;

-- Producto 24: PHANTOM VERDE
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM VERDE', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 0);
END $$;

-- Producto 25: REACT GATO BLANCO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('REACT GATO BLANCO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 3);
END $$;

-- Producto 26: PHANTOM NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM NEGRO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 1);
END $$;

-- Producto 27: STREET GATO BLANCO PIPETA DORADA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO BLANCO PIPETA DORADA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 1);
END $$;

-- Producto 28: LUNAR GATO BLANCO SUELA ROJA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO BLANCO SUELA ROJA', 'Generic', 'Botín Generic para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 0);
END $$;

-- Producto 29: LUNAR GATO BLANCO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('LUNAR GATO BLANCO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 0);
END $$;

-- Producto 30: R10 DORADOS
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('R10 DORADOS', 'Nike', 'Botín Nike para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8US', 0);
END $$;

-- Producto 31: TIEMPO R10 BLANCOS
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO R10 BLANCOS', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 0);
END $$;

-- Producto 32: TIEMPO NEGROS
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO NEGROS', 'Nike', 'Botín Nike para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/fg-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 0);
END $$;

-- Producto 33: PHANTOM VERDES
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM VERDES', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 0);
END $$;

-- Producto 34: TIEMPO LEGEND VIOLETA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO LEGEND VIOLETA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 0);
END $$;

-- Producto 35: REACT GATO SALMON
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('REACT GATO SALMON', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 36: PHANTOM CELESTES
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM CELESTES', 'Nike', 'Botín Nike para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 0);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 37: PHANTOM NEGROS
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM NEGROS', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/fg-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 0);
END $$;

-- Producto 38: PHANTOM NEGRO Y ROJO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM NEGRO Y ROJO', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/nike-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
END $$;

-- Producto 39: JOMA ROSA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('JOMA ROSA', 'Generic', 'Botín Generic para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
END $$;

-- Producto 40: COPA BLANCO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('COPA BLANCO', 'Adidas', 'Botín Adidas para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/fg-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '8.5US', 1);
END $$;

-- Producto 41: PHANTOM VIOLETA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PHANTOM VIOLETA', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/nike-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 42: STREET GATO VIOLETA CON VERDE
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO VIOLETA CON VERDE', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 0);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 43: STREET GATO SUELA DE COLOR
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO SUELA DE COLOR', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 0);
END $$;

-- Producto 44: GATO SUPRIME SB NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('GATO SUPRIME SB NEGRO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 45: TIEMPO NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO NEGRO', 'Nike', 'Botín Nike para césped sintético. Excelente calidad y comodidad.', 89999, 'sintetico', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 0);
END $$;

-- Producto 46: CRAZY FAST NEGRO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('CRAZY FAST NEGRO', 'Adidas', 'Botín Adidas para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/fg-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 47: AIR ZOOM GRISES
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('AIR ZOOM GRISES', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/nike-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '9.5US', 1);
END $$;

-- Producto 48: TIEMPO BLANCO
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO BLANCO', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/sneaker-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 49: PREMIER BLANCO PIPETA NEGRA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PREMIER BLANCO PIPETA NEGRA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 50: PREMIER GAMUZA SUELA CELESTE
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PREMIER GAMUZA SUELA CELESTE', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 51: PREDATOR NEGROS
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PREDATOR NEGROS', 'Adidas', 'Botín Adidas para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 52: AIR ZOOM NEGROS
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('AIR ZOOM NEGROS', 'Nike', 'Botín Nike para fútbol 11. Excelente calidad y comodidad.', 89999, 'futbol11', '/products/fg-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 53: STREET GATO LILA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('STREET GATO LILA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '10US', 1);
END $$;

-- Producto 54: TIEMPO LEGEND NEGROS PIPETA GRISYAZUL
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('TIEMPO LEGEND NEGROS PIPETA GRISYAZUL', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/futsal-2.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '11US', 1);
END $$;

-- Producto 55: PREMIER NEGRO SUELA ROJA
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('PREMIER NEGRO SUELA ROJA', 'Nike', 'Botín Nike para fútsal. Excelente calidad y comodidad.', 89999, 'futsal', '/products/nike-1.jpg', false, true)
  RETURNING id INTO product_id;

  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '11US', 1);
END $$;

-- =====================================================
-- FIN DE LA IMPORTACIÓN
-- =====================================================

-- Verificar cantidad de productos importados
SELECT
  (SELECT COUNT(*) FROM products) as total_productos,
  (SELECT COUNT(*) FROM product_variants) as total_variantes,
  (SELECT COUNT(*) FROM products WHERE featured = true) as destacados;
