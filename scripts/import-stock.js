const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Leer el archivo Excel
const wb = XLSX.readFile('/home/marc/Descargas/STOCK DISPONIBLE.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

// Agrupar productos por MODELO + COLOR + SUPERFICIE
const productsMap = new Map();

rows.forEach(row => {
  const modelo = (row['MODELO '] || row['MODELO'] || '').trim();
  const color = (row['COLOR'] || '').trim();
  const superficie = (row['SUPERFICIE'] || '').trim().toLowerCase();
  const cantidad = row['CAN.'] || 0;
  const talle = (row['TALLE'] || '').toString().trim();

  if (!modelo) return;

  // Key única para cada producto (modelo + color + superficie)
  const key = `${modelo}|${color}|${superficie}`;

  // Mapear superficie a categoría
  let category = 'futsal';
  if (superficie.includes('sintetico') || superficie.includes('sintético')) category = 'sintetico';
  if (superficie.includes('futbol 11') || superficie.includes('fútbol 11')) category = 'futbol11';

  // Extraer marca del nombre
  let brand = 'Generic';
  const modeloLower = modelo.toLowerCase();
  if (modeloLower.includes('nike')) brand = 'Nike';
  else if (modeloLower.includes('adidas')) brand = 'Adidas';
  else if (modeloLower.includes('puma')) brand = 'Puma';

  // Limpiar nombre (quitar marca del inicio)
  let name = modelo.replace(/^(NIKE|ADIDAS|PUMA)\s+/i, '').trim();

  // Agregar color al nombre si es relevante
  const fullName = color ? `${name} ${color}` : name;

  if (!productsMap.has(key)) {
    productsMap.set(key, {
      name: fullName,
      brand,
      category,
      variants: []
    });
  }

  // Agregar variante (talle y stock)
  if (talle) {
    productsMap.get(key).variants.push({
      size: talle,
      stock: parseInt(cantidad) || 0
    });
  }
});

// Convertir a array de productos con IDs
const products = Array.from(productsMap.values()).map((p, index) => {
  const id = (index + 1).toString();

  // Generar descripción automática
  const surfaceText = p.category === 'futsal' ? 'fútsal' :
                      p.category === 'sintetico' ? 'césped sintético' : 'fútbol 11';
  const description = `Botín ${p.brand} para ${surfaceText}. Excelente calidad y comodidad.`;

  // Imágenes locales por categoría
  const imagesByCategory = {
    futsal: ['/products/futsal-1.jpg', '/products/futsal-2.jpg', '/products/nike-1.jpg', '/products/sneaker-1.jpg'],
    sintetico: ['/products/nike-2.jpg', '/products/fg-1.jpg', '/products/sneaker-1.jpg'],
    futbol11: ['/products/fg-1.jpg', '/products/nike-2.jpg', '/products/futsal-1.jpg']
  };
  const categoryImages = imagesByCategory[p.category] || imagesByCategory.futsal;
  const imageUrl = categoryImages[index % categoryImages.length];

  // Determinar si tiene stock
  const hasStock = p.variants.some(v => v.stock > 0);

  // IDs de productos destacados (variedad de categorías y marcas)
  const featuredIds = ['2', '7', '10', '17', '21'];

  return {
    id,
    name: p.name,
    brand: p.brand,
    description,
    price: 89999, // Precio placeholder - ajustar después
    category: p.category,
    imageUrl,
    featured: featuredIds.includes(id),
    active: true,
    variants: p.variants.map((v, vi) => ({
      id: `${id}-${vi}`,
      size: v.size,
      stock: v.stock
    })),
    createdAt: new Date().toISOString().split('T')[0]
  };
});

// Mostrar resumen
console.log('=== RESUMEN DE IMPORTACIÓN ===\n');
console.log(`Total de productos: ${products.length}`);
console.log(`Con stock: ${products.filter(p => p.variants.some(v => v.stock > 0)).length}`);
console.log(`Sin stock: ${products.filter(p => p.variants.every(v => v.stock === 0)).length}`);
console.log('\n--- Por categoría ---');
console.log(`Futsal: ${products.filter(p => p.category === 'futsal').length}`);
console.log(`Sintético: ${products.filter(p => p.category === 'sintetico').length}`);
console.log(`Fútbol 11: ${products.filter(p => p.category === 'futbol11').length}`);
console.log('\n--- Por marca ---');
console.log(`Nike: ${products.filter(p => p.brand === 'Nike').length}`);
console.log(`Adidas: ${products.filter(p => p.brand === 'Adidas').length}`);
console.log(`Puma: ${products.filter(p => p.brand === 'Puma').length}`);
console.log(`Otros: ${products.filter(p => p.brand === 'Generic').length}`);

console.log('\n--- Primeros 15 productos ---\n');
products.slice(0, 15).forEach((p, i) => {
  const stockInfo = p.variants.map(v => `${v.size}:${v.stock}`).join(', ');
  console.log(`${i+1}. [${p.brand}] ${p.name}`);
  console.log(`   Categoría: ${p.category} | Talles: ${stockInfo}`);
});

// Generar el código TypeScript para data.ts
const dataFileContent = `import { Product, Category } from "@/types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Fútsal",
    slug: "futsal",
    description: "Botines para fútsal / indoor",
  },
  {
    id: "2",
    name: "Sintético",
    slug: "sintetico",
    description: "Botines para césped sintético",
  },
  {
    id: "3",
    name: "Fútbol 11",
    slug: "futbol11",
    description: "Botines para césped natural",
  },
  {
    id: "4",
    name: "Accesorios",
    slug: "accesorios",
    description: "Medias, canilleras y más",
  },
];

// Datos importados desde STOCK DISPONIBLE.xlsx
export const products: Product[] = ${JSON.stringify(products, null, 2)};

export const brands = ["Nike", "Adidas", "Puma"];

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category && p.active);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured && p.active);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}
`;

// Guardar el archivo
fs.writeFileSync(path.join(__dirname, '../src/lib/data.ts'), dataFileContent);
console.log('\n✅ Archivo src/lib/data.ts actualizado con', products.length, 'productos');
