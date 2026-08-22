import Link from "next/link";
import Image from "next/image";

const WHATSAPP = "https://wa.me/message/CJPQFIY4XTSJC1";
const INSTAGRAM = "https://instagram.com/botinesalasur";

const CATEGORIAS = [
  { label: "Fútsal", href: "/catalogo?categoria=futsal" },
  { label: "Sintético", href: "/catalogo?categoria=sintetico" },
  { label: "Fútbol 11", href: "/catalogo?categoria=futbol11" },
  { label: "Accesorios", href: "/catalogo?categoria=accesorios" },
  { label: "Catálogo completo", href: "/catalogo" },
];

export default function Footer() {
  return (
    <footer className="border-t border-dark-line bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:col-span-2 max-w-sm">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-botinesalasur-circular.png"
                alt=""
                width={44}
                height={44}
                className="w-11 h-11 rounded-full"
              />
              <span className="display-tight text-xl">
                Botinesala<span className="text-primary">Sur</span>
              </span>
            </div>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Botines para fútsal, sintético y fútbol 11. Te ayudamos a elegir
              el modelo y el talle, y te lo mandamos a cualquier punto del país.
            </p>
            <p className="mt-4 flex items-center gap-2 text-gray-400">
              <svg
                className="w-5 h-5 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              Llavallol, Buenos Aires
            </p>
          </div>

          {/* Categorías */}
          <nav aria-labelledby="footer-categorias">
            <h2
              id="footer-categorias"
              className="label text-gray-500 mb-4"
            >
              Categorías
            </h2>
            <ul className="space-y-2.5">
              {CATEGORIAS.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto y envíos */}
          <div>
            <h2 className="label text-gray-500 mb-4">Hablemos</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @botinesalasur
                </a>
              </li>
            </ul>

            <h2 className="label text-gray-500 mt-8 mb-3">Envíos</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4 text-gray-400">
                <dt>GBA Sur, en moto</dt>
                <dd className="tnum text-gray-300">$2.500</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-400">
                <dt>Resto del país</dt>
                <dd className="tnum text-gray-300">$5.500</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-dark-line flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Botinesala Sur
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="label">Pagás con</span>
            <span className="text-gray-400">MercadoPago</span>
            <span aria-hidden className="text-dark-line">
              |
            </span>
            <span className="text-gray-400">Todas las tarjetas</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
