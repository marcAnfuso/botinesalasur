"use client";

import { useState } from "react";
import Link from "next/link";

interface ProductRow {
  nombre: string;
  marca: string;
  descripcion: string;
  precio: string;
  categoria: string;
  imagen: string;
  talles: string; // "39,40,41,42" o "39:3,40:5,41:2" (talle:stock)
  destacado: string;
}

const EJEMPLO_CSV = `nombre,marca,descripcion,precio,categoria,imagen,talles,destacado
Copa Pure.3,Adidas,Botín de fútsal con suela de goma,89999,futsal,https://link-imagen.com/foto.jpg,"39:2,40:3,41:2,42:1",si
Mercurial Vapor 15,Nike,Diseño aerodinámico para máxima velocidad,109999,sintetico,https://link-imagen.com/foto2.jpg,"40:1,41:3,42:2",no
Medias Antideslizantes,Generic,Medias con grip interior,12999,accesorios,https://link-imagen.com/medias.jpg,"Único:20",no`;

export default function ImportarPage() {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<ProductRow[]>([]);
  const [error, setError] = useState("");

  const parseCSV = (text: string): ProductRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) throw new Error("El CSV debe tener al menos una fila de datos");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["nombre", "marca", "precio", "categoria", "imagen", "talles"];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Falta la columna: ${required}`);
      }
    }

    const products: ProductRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parsear CSV respetando comillas
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: ProductRow = {
        nombre: values[headers.indexOf("nombre")] || "",
        marca: values[headers.indexOf("marca")] || "",
        descripcion: values[headers.indexOf("descripcion")] || "",
        precio: values[headers.indexOf("precio")] || "0",
        categoria: values[headers.indexOf("categoria")] || "futsal",
        imagen: values[headers.indexOf("imagen")] || "",
        talles: values[headers.indexOf("talles")] || "",
        destacado: values[headers.indexOf("destacado")] || "no",
      };

      if (row.nombre && row.precio) {
        products.push(row);
      }
    }

    return products;
  };

  const handlePreview = () => {
    setError("");
    try {
      const products = parseCSV(csvText);
      setPreview(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar CSV");
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    // TODO: Enviar a Supabase
    // Por ahora mostramos los datos que se guardarían
    const productsToSave = preview.map((row) => {
      // Parsear talles: "39:2,40:3" -> [{size: "39", stock: 2}, ...]
      const variants = row.talles.split(",").map((t) => {
        const [size, stock] = t.trim().split(":");
        return {
          size: size.trim(),
          stock: parseInt(stock) || 1,
        };
      });

      return {
        name: row.nombre,
        brand: row.marca,
        description: row.descripcion || `Botín ${row.marca} ${row.nombre}`,
        price: parseInt(row.precio),
        category: row.categoria,
        image_url: row.imagen,
        featured: row.destacado.toLowerCase() === "si",
        active: true,
        variants,
      };
    });

    console.log("Productos a guardar:", productsToSave);

    alert(
      `Se importarían ${productsToSave.length} productos.\n\n` +
      `Cuando conectes Supabase, estos datos se guardarán en la base de datos.\n\n` +
      `Por ahora, mirá la consola del navegador (F12) para ver los datos.`
    );
  };

  const formatPrice = (price: string) => {
    const num = parseInt(price);
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/productos"
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Importar productos</h1>
          <p className="text-gray-400 mt-1">Cargá varios productos de una vez desde un CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instrucciones y entrada */}
        <div className="space-y-6">
          {/* Formato */}
          <div className="bg-dark-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Formato del CSV</h2>
            <p className="text-gray-400 text-sm mb-4">
              Copiá y pegá desde Google Sheets o Excel. Las columnas deben ser:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">Columna</th>
                    <th className="text-left py-2 text-gray-400">Ejemplo</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">nombre</td>
                    <td className="py-2">Copa Pure.3</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">marca</td>
                    <td className="py-2">Adidas, Nike, Puma</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">descripcion</td>
                    <td className="py-2">Botín de fútsal...</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">precio</td>
                    <td className="py-2">89999 (sin puntos)</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">categoria</td>
                    <td className="py-2">futsal, sintetico, futbol11, accesorios</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">imagen</td>
                    <td className="py-2">URL de la imagen</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-medium">talles</td>
                    <td className="py-2">39:2,40:3,41:1 (talle:stock)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">destacado</td>
                    <td className="py-2">si / no</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ejemplo */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-400 font-medium mb-2">CSV de ejemplo</h3>
            <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
              {EJEMPLO_CSV}
            </pre>
            <button
              onClick={() => setCsvText(EJEMPLO_CSV)}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Usar ejemplo
            </button>
          </div>

          {/* Input */}
          <div className="bg-dark-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pegá tu CSV</h2>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="nombre,marca,descripcion,precio,categoria,imagen,talles,destacado&#10;Copa Pure.3,Adidas,Botín de fútsal,89999,futsal,https://...,39:2,40:3,si"
              rows={10}
              className="input-field font-mono text-sm resize-none"
            />

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            <button
              onClick={handlePreview}
              disabled={!csvText.trim()}
              className="btn-secondary mt-4 w-full"
            >
              Previsualizar
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="bg-dark-card rounded-xl p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Vista previa ({preview.length} productos)
              </h2>
              {preview.length > 0 && (
                <button onClick={handleImport} className="btn-primary">
                  Importar todos
                </button>
              )}
            </div>

            {preview.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Pegá un CSV y hacé click en "Previsualizar"
              </p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {preview.map((product, i) => (
                  <div
                    key={i}
                    className="bg-dark rounded-lg p-4 border border-gray-800"
                  >
                    <div className="flex items-start gap-3">
                      {product.imagen && (
                        <div className="w-16 h-16 rounded bg-dark-lighter flex-shrink-0 overflow-hidden">
                          <img
                            src={product.imagen}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary">{product.marca}</p>
                        <p className="font-medium text-white truncate">
                          {product.nombre}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {product.descripcion || "Sin descripción"}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-white font-semibold">
                            {formatPrice(product.precio)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.categoria}
                          </span>
                          <span className="text-xs text-gray-500">
                            Talles: {product.talles}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips para imágenes de Google Drive */}
      <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-yellow-400 font-semibold mb-2">
          Tip: Imágenes desde Google Drive
        </h3>
        <p className="text-gray-400 text-sm mb-3">
          Para usar imágenes de Google Drive, necesitás convertir el link compartido:
        </p>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Hacé click derecho en la imagen → "Obtener enlace" → "Cualquier persona con el enlace"</li>
          <li>
            Copiá el ID del archivo (es la parte larga después de <code className="text-yellow-400">/d/</code>)
          </li>
          <li>
            Usá este formato: <code className="text-yellow-400 break-all">https://drive.google.com/uc?export=view&id=TU_ID_AQUI</code>
          </li>
        </ol>
        <p className="text-gray-500 text-xs mt-3">
          Alternativa: Subí las imágenes a <a href="https://imgur.com" target="_blank" className="text-primary">Imgur</a> o <a href="https://cloudinary.com" target="_blank" className="text-primary">Cloudinary</a> (gratis) para mejor rendimiento.
        </p>
      </div>
    </div>
  );
}
