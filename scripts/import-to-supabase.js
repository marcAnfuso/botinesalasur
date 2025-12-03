const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://rgfwynxkyvcmcekmhajy.supabase.co';
const supabaseKey = 'sb_publishable_dZITc4KdVxLO82Jju9AltQ_bmM0Ow9U';

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer productos del JSON exportado
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8')
);

async function importProducts() {
  console.log('=== IMPORTACIÓN A SUPABASE ===\n');
  console.log(`Productos a importar: ${products.length}\n`);

  // Primero eliminar productos existentes (los de ejemplo)
  console.log('Limpiando datos existentes...');

  const { error: deleteVariantsError } = await supabase
    .from('product_variants')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteVariantsError && deleteVariantsError.code !== 'PGRST116') {
    console.log('Nota variantes:', deleteVariantsError.message);
  }

  const { error: deleteProductsError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteProductsError && deleteProductsError.code !== 'PGRST116') {
    console.log('Nota productos:', deleteProductsError.message);
  }

  console.log('Datos limpiados.\n');
  console.log('Importando productos...\n');

  let imported = 0;
  let errors = 0;
  let totalVariants = 0;

  for (const product of products) {
    // Insertar producto
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.imageUrl,
        featured: product.featured || false,
        active: product.active !== false
      })
      .select()
      .single();

    if (productError) {
      console.error(`✗ Error en "${product.name}": ${productError.message}`);
      errors++;
      continue;
    }

    // Insertar variantes
    if (product.variants && product.variants.length > 0) {
      const variants = product.variants.map(v => ({
        product_id: newProduct.id,
        size: v.size,
        stock: v.stock || 0
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variants);

      if (variantError) {
        console.error(`  Variantes error: ${variantError.message}`);
      } else {
        totalVariants += variants.length;
      }
    }

    imported++;
    const stockTotal = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    console.log(`✓ [${product.brand}] ${product.name} (${product.variants?.length || 0} talles, ${stockTotal} unidades)`);
  }

  console.log('\n=== RESUMEN ===');
  console.log(`Productos importados: ${imported}`);
  console.log(`Variantes importadas: ${totalVariants}`);
  console.log(`Errores: ${errors}`);
  console.log('\n✅ Importación completada!');
}

importProducts().catch(console.error);
