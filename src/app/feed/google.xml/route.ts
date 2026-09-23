import { getProducts } from "@/lib/supabase-data";
import { nombreProducto } from "@/lib/nombre-producto";
import { urlProducto } from "@/lib/producto-url";
import { descripcionProducto, urlAbsoluta, BASE_URL } from "@/lib/seo";

// Feed para Google Merchant Center (fichas gratuitas de Shopping): un ítem
// por talle, agrupados por producto. Se carga una vez en Merchant Center
// como "feed programado" y Google lo relee solo.
export const revalidate = 3600;

const x = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const products = await getProducts();
  const items = products.flatMap((p) => {
    const nombre = nombreProducto(p.brand, p.name);
    const link = `${BASE_URL}${urlProducto(p)}`;
    const imagen = urlAbsoluta(p.imageUrl);
    const descripcion = descripcionProducto(p);
    const variantes = p.variants.length ? p.variants : [{ id: p.id, size: "", stock: 0 }];
    return variantes.map(
      (v) => `
    <item>
      <g:id>${x(`${p.codigo ?? p.id}-${v.size || "u"}`)}</g:id>
      <g:item_group_id>${x(String(p.codigo ?? p.id))}</g:item_group_id>
      <g:title>${x(`${nombre}${v.size ? ` - Talle ${v.size}` : ""}`)}</g:title>
      <g:description>${x(descripcion)}</g:description>
      <g:link>${x(link)}</g:link>
      <g:image_link>${x(imagen)}</g:image_link>
      <g:availability>${v.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${p.price.toFixed(2)} ARS</g:price>
      <g:condition>new</g:condition>
      <g:brand>${x(p.brand)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Apparel &amp; Accessories &gt; Shoes</g:google_product_category>
      <g:product_type>${x(`Botines > ${p.category}`)}</g:product_type>
      ${v.size ? `<g:size>${x(v.size)}</g:size>` : ""}
      <g:age_group>adult</g:age_group>
      <g:gender>unisex</g:gender>
    </item>`
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Botinesala Sur</title>
    <link>${BASE_URL}</link>
    <description>Botines de fútsal, sintético y fútbol 11</description>${items.join("")}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
