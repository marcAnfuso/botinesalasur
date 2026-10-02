import Link from "next/link";
import { TIENDA } from "@/lib/tienda";

// La 404 de Next viene en inglés y sin salida. Esta manda al catálogo.
export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
      <p className="label text-primary">Error 404</p>
      <h1 className="display text-4xl md:text-5xl text-white mt-2">Esa página no existe</h1>
      <p className="text-gray-400 mt-4 max-w-prose mx-auto">
        Puede que el link esté mal escrito o que el producto ya no esté. Lo que sí hay, está en el catálogo.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/catalogo" className="btn-primary">Ver catálogo</Link>
        <a href={TIENDA.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-secondary">Escribinos por WhatsApp</a>
      </div>
    </div>
  );
}
