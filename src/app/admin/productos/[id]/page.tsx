"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { categories, brands, formatPrice } from "@/lib/supabase-data";

interface Variant {
  id: string;
  size: string;
  stock: number;
  isNew?: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  featured: boolean;
  active: boolean;
  variants: Variant[];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
  const [variants, setVariants] = useState<Variant[]>([]);
  const [originalVariants, setOriginalVariants] = useState<Variant[]>([]);

  // Cargar producto
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        if (!res.ok) throw new Error("Producto no encontrado");

        const product: Product = await res.json();
        setFormData({
          name: product.name,
          brand: product.brand,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          image_url: product.image_url,
          featured: product.featured,
          active: product.active,
        });
        setVariants(product.variants || []);
        setOriginalVariants(product.variants || []);
      } catch (err) {
        setError("Error al cargar el producto");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...variants];
    if (field === "stock") {
      updated[index].stock = Math.max(0, Number(value) || 0);
    } else if (field === "size") {
      updated[index].size = value as string;
    }
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { id: `new-${Date.now()}`, size: "", stock: 0, isNew: true }]);
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];

    if (!variant.isNew && variant.id) {
      // Eliminar de la base de datos
      try {
        const res = await fetch(`/api/admin/variants/${variant.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Error al eliminar");
      } catch (err) {
        setError("Error al eliminar la variante");
        return;
      }
    }

    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      // 1. Actualizar producto
      const productRes = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      });

      if (!productRes.ok) {
        const data = await productRes.json();
        throw new Error(data.error || "Error al actualizar producto");
      }

      // 2. Actualizar variantes existentes
      const existingVariants = variants.filter((v) => !v.isNew && v.size.trim());
      if (existingVariants.length > 0) {
        const variantsRes = await fetch(`/api/admin/products/${params.id}/variants`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variants: existingVariants.map((v) => ({ id: v.id, stock: v.stock })),
          }),
        });

        if (!variantsRes.ok) {
          console.error("Error actualizando variantes");
        }
      }

      // 3. Crear nuevas variantes
      const newVariants = variants.filter((v) => v.isNew && v.size.trim());
      for (const variant of newVariants) {
        await fetch(`/api/admin/products/${params.id}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ size: variant.size, stock: variant.stock }),
        });
      }

      setSuccessMessage("Producto actualizado correctamente");

      // Recargar variantes para obtener IDs correctos
      const res = await fetch(`/api/admin/products/${params.id}`);
      const product = await res.json();
      setVariants(product.variants || []);
      setOriginalVariants(product.variants || []);

    } catch (err: any) {
      setError(err.message || "Error al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar solo stock (rápido)
  const handleSaveStock = async () => {
    setIsSaving(true);
    setError("");

    try {
      const existingVariants = variants.filter((v) => !v.isNew);
      const res = await fetch(`/api/admin/products/${params.id}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variants: existingVariants.map((v) => ({ id: v.id, stock: v.stock })),
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar stock");

      setSuccessMessage("Stock actualizado");
      setOriginalVariants([...variants]);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Error al actualizar stock");
    } finally {
      setIsSaving(false);
    }
  };

  const hasStockChanges = () => {
    return variants.some((v, i) => {
      const original = originalVariants.find((ov) => ov.id === v.id);
      return original && original.stock !== v.stock;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Editar producto</h1>
          <p className="text-gray-400 mt-1">{formData.name}</p>
        </div>
        <Link
          href={`/producto/${params.id}`}
          target="_blank"
          className="btn-secondary flex items-center gap-2"
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
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          Ver en tienda
        </Link>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-field/10 border border-field/30 text-field rounded-lg p-4 mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="bg-dark-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Información básica
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Marca
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="select-field"
                  >
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
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
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
                    Precio (ARS)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  URL de imagen
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="bg-dark-card rounded-xl p-6">
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
                    Se mostrará en la sección de destacados
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
                    Visible en la tienda
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? (
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
                "Guardar cambios"
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

        {/* Panel lateral - Stock */}
        <div className="space-y-6">
          {/* Preview */}
          {formData.image_url && (
            <div className="bg-dark-card rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Vista previa</h3>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-dark">
                <Image
                  src={formData.image_url}
                  alt={formData.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center mt-3 font-medium text-white">
                {formatPrice(Number(formData.price) || 0)}
              </p>
            </div>
          )}

          {/* Gestión de Stock */}
          <div className="bg-dark-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Talles y Stock</h3>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                + Agregar talle
              </button>
            </div>

            <div className="space-y-3">
              {variants.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay talles configurados
                </p>
              ) : (
                variants.map((variant, index) => (
                  <div key={variant.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      placeholder="Talle"
                      disabled={!variant.isNew}
                      className="input-field w-24 text-center disabled:opacity-60"
                    />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      min="0"
                      className="input-field flex-1"
                      placeholder="Stock"
                    />
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
                ))
              )}
            </div>

            {hasStockChanges() && (
              <button
                type="button"
                onClick={handleSaveStock}
                disabled={isSaving}
                className="w-full mt-4 btn-secondary"
              >
                Guardar stock rápido
              </button>
            )}

            {/* Resumen de stock */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total en stock:</span>
                <span className="text-white font-medium">
                  {variants.reduce((sum, v) => sum + v.stock, 0)} unidades
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Talles disponibles:</span>
                <span className="text-white font-medium">
                  {variants.filter((v) => v.stock > 0).length} de {variants.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
