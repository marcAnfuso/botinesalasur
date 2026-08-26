"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categories, brands } from "@/lib/supabase-data";
import { prepararImagen } from "@/lib/preparar-imagen";

interface Variant {
  size: string;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "futsal",
    image_url: "",
    featured: false,
    active: true,
  });
  const [variants, setVariants] = useState<Variant[]>([
    { size: "39", stock: 0 },
    { size: "40", stock: 0 },
    { size: "41", stock: 0 },
    { size: "42", stock: 0 },
    { size: "43", stock: 0 },
    { size: "44", stock: 0 },
  ]);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setError("");
    setUploadMessage("");
    try {
      // Las fotos de celular se achican acá antes de viajar.
      const preparada = await prepararImagen(file);
      const body = new FormData();
      body.append("file", preparada.file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
      setFormData((prev) => ({ ...prev, image_url: data.url }));
      const kb = Math.round(preparada.file.size / 1024);
      setUploadMessage(
        preparada.ancho ? `Foto subida (${preparada.ancho}×${preparada.alto}, ${kb} KB)` : "Foto subida"
      );
    } catch (err: any) {
      setError(err.message || "No se pudo subir la foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants];
    if (field === "stock") {
      updated[index][field] = parseInt(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          image_url: formData.image_url || "/products/default.jpg",
          featured: formData.featured,
          active: formData.active,
          variants: variants.filter((v) => v.size.trim() !== ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear producto");
      }

      router.push("/admin/productos");
    } catch (err: any) {
      setError(err.message || "Error al crear el producto");
      setIsSubmitting(false);
    }
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
          <h1 className="text-3xl font-bold text-white">Nuevo producto</h1>
          <p className="text-gray-400 mt-1">Completá los datos del producto</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 mb-6 max-w-3xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Información básica */}
        <div className="bg-dark-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Información básica
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Marca *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="select-field"
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value="otro">Otra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Ej: Copa Pure.3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="input-field resize-none"
                placeholder="Descripción breve del producto..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="select-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Precio (ARS) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="89999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Foto del producto
              </label>

              {formData.image_url ? (
                <div className="flex items-center gap-4 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.image_url}
                    alt=""
                    className="w-24 h-24 object-cover rounded border border-dark-line bg-dark"
                  />
                  <div className="text-sm">
                    {uploadMessage && <p className="text-field">{uploadMessage}</p>}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, image_url: "" }));
                        setUploadMessage("");
                      }}
                      className="mt-1 text-gray-400 hover:text-white transition-colors"
                    >
                      Cambiar foto
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-dark-line rounded-lg px-4 py-8 text-center cursor-pointer hover:border-gray-500 transition-colors ${
                    isUploading ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="sr-only"
                    disabled={isUploading}
                  />
                  <svg
                    className="w-7 h-7 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-gray-300">
                    {isUploading ? "Subiendo..." : "Tocá para elegir una foto o arrastrala acá"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Desde el celular podés sacarla en el momento. Se achica sola antes de subir.
                  </span>
                </label>
              )}

              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                  O pegar la dirección de una imagen que ya está en internet
                </summary>
                <input
                  type="text"
                  inputMode="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="input-field mt-2"
                  placeholder="https://..."
                />
              </details>
            </div>
          </div>
        </div>

        {/* Talles y stock */}
        <div className="bg-dark-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Talles y stock</h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-sm text-primary hover:text-primary-light transition-colors"
            >
              + Agregar talle
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24">
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) =>
                      handleVariantChange(index, "size", e.target.value)
                    }
                    className="input-field text-center"
                    placeholder="Talle"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(index, "stock", e.target.value)
                    }
                    min="0"
                    className="input-field"
                    placeholder="Stock"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-dark-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Opciones</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-700 bg-dark text-primary focus:ring-primary"
              />
              <div>
                <span className="text-white">Producto destacado</span>
                <p className="text-sm text-gray-500">
                  Se mostrará en la sección de destacados del inicio
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-700 bg-dark text-primary focus:ring-primary"
              />
              <div>
                <span className="text-white">Producto activo</span>
                <p className="text-sm text-gray-500">
                  Desactivá esto para ocultar el producto de la tienda
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar producto"
            )}
          </button>
          <Link
            href="/admin/productos"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
