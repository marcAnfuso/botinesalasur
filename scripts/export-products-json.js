const fs = require('fs');
const path = require('path');

// Leer data.ts
const dataFile = fs.readFileSync(path.join(__dirname, '../src/lib/data.ts'), 'utf-8');

// Extraer el array de productos usando regex
const match = dataFile.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);

if (!match) {
  console.error('No se encontró el array de productos');
  process.exit(1);
}

// Evaluar el JSON (es un array literal válido)
const productsJson = match[1]
  .replace(/\/\/.*/g, '') // Eliminar comentarios
  .replace(/,(\s*[}\]])/g, '$1'); // Eliminar trailing commas

let products;
try {
  products = eval(productsJson);
} catch (e) {
  console.error('Error parseando productos:', e.message);
  process.exit(1);
}

// Guardar como JSON
fs.writeFileSync(
  path.join(__dirname, 'products.json'),
  JSON.stringify(products, null, 2)
);

console.log(`Exportados ${products.length} productos a scripts/products.json`);
