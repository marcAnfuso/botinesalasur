const fs = require('fs');
const path = require('path');

// Leer productos del JSON
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8')
);

let sql = `-- =====================================================
-- IMPORTACIÓN DE PRODUCTOS DESDE EXCEL
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Primero limpiar los productos de ejemplo
DELETE FROM product_variants;
DELETE FROM products;

`;

products.forEach((product, index) => {
  // Escapar comillas simples
  const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';

  const name = escapeSql(product.name);
  const brand = escapeSql(product.brand);
  const description = escapeSql(product.description);
  const imageUrl = escapeSql(product.imageUrl);

  sql += `-- Producto ${index + 1}: ${product.name}
DO $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO products (name, brand, description, price, category, image_url, featured, active)
  VALUES ('${name}', '${brand}', '${description}', ${product.price}, '${product.category}', '${imageUrl}', ${product.featured || false}, ${product.active !== false})
  RETURNING id INTO product_id;

`;

  // Agregar variantes - COMBINAR DUPLICADOS
  if (product.variants && product.variants.length > 0) {
    // Agrupar variantes por talle y sumar stock
    const variantMap = new Map();
    product.variants.forEach(variant => {
      const size = variant.size;
      if (variantMap.has(size)) {
        variantMap.set(size, variantMap.get(size) + (variant.stock || 0));
      } else {
        variantMap.set(size, variant.stock || 0);
      }
    });

    // Insertar variantes únicas
    variantMap.forEach((stock, size) => {
      const sizeEscaped = escapeSql(size);
      sql += `  INSERT INTO product_variants (product_id, size, stock) VALUES (product_id, '${sizeEscaped}', ${stock});\n`;
    });
  }

  sql += `END $$;\n\n`;
});

sql += `-- =====================================================
-- FIN DE LA IMPORTACIÓN
-- =====================================================

-- Verificar cantidad de productos importados
SELECT
  (SELECT COUNT(*) FROM products) as total_productos,
  (SELECT COUNT(*) FROM product_variants) as total_variantes,
  (SELECT COUNT(*) FROM products WHERE featured = true) as destacados;
`;

// Guardar el archivo SQL
fs.writeFileSync(path.join(__dirname, 'import-products.sql'), sql);

console.log(`✅ Archivo SQL generado: scripts/import-products.sql`);
console.log(`   ${products.length} productos (duplicados de talles combinados)`);
