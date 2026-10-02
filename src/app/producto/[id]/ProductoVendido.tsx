import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { nombreProducto } from "@/lib/nombre-producto";
import { formatCodigo } from "@/lib/codigo";
import { TIENDA } from "@/lib/tienda";
import ProductCard from "@/components/ProductCard";

// Lo que ve quien llega a un botín que ya no está: desde una historia vieja,
// un link compartido o Google. Sin callejón sin salida: alternativas con
// stock y una forma de pedir que le avisen.
export default function ProductoVendido({ product, alternativas }: { product: Product; alternativas: Product[] }) {
  const nombre = nombreProducto(product.brand, product.name);
  const codigo = product.codigo ? ` ${formatCodigo(product.codigo)}` : "";
  const aviso = `${TIENDA.whatsapp}?text=${encodeURIComponent(`Hola! Vi el ${nombre}${codigo} en la web y ya se vendió. ¿Me avisan si vuelve a entrar en talle ___?`)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        <div className="relative w-full sm:w-56 aspect-square flex-shrink-0 overflow-hidden bg-dark-lighter">
          <Image src={product.imageUrl} alt={nombre} fill className="object-cover grayscale opacity-50" sizes="(max-width: 640px) 100vw, 224px" />
          <span className="absolute top-0 left-0 bg-dark/90 text-gray-300 label px-2.5 py-1.5 border-r border-b border-dark-line">Vendido</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="label text-primary">{product.brand}</p>
          <h1 className="display text-3xl md:text-4xl text-white mt-1">{nombre}</h1>
          <p className="text-xl text-gray-200 mt-4">Este botín ya se vendió.</p>
          <p className="text-gray-400 mt-2 max-w-prose">
            Tenemos pocos pares de cada modelo y vuelan. Abajo te dejamos los que sí están, y si querés
            que te avisemos cuando entre uno parecido en tu talle, escribinos.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/catalogo" className="btn-primary text-center">Ver lo que hay</Link>
            <a href={aviso} target="_blank" rel="noopener noreferrer" className="btn-secondary text-center">Avisame si vuelve</a>
          </div>
        </div>
      </div>

      {alternativas.length > 0 && (
        <section className="mt-12 md:mt-16">
          <h2 className="display text-2xl md:text-3xl text-white">Parecidos, con stock ahora</h2>
          <p className="text-gray-400 mt-1 mb-6">Primero los que tienen tu mismo talle.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {alternativas.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
