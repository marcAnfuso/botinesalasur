"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/supabase-data";

interface ProductosAdminClientProps {
  products: Product[];
  categories: Category[];
}

export default function ProductosAdminClient({
  products,
  categories,
}: ProductosAdminClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showActive, setShowActive] = useState<"all" | "active" | "inactive">("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    const matchesStatus =
      showActive === "all" ||
      (showActive === "active" && product.active) ||
      (showActive === "inactive" && !product.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getTotalStock = (variants: { stock: number }[]) =>
    variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Productos</h1>
          <p className="text-gray-400 mt-1">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Agregar producto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-dark-card rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select-field sm:w-48"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={showActive}
          onChange={(e) => setShowActive(e.target.value as typeof showActive)}
          className="select-field sm:w-40"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Ocultos</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Producto
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Categoría
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Precio
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Stock
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Estado
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-dark-lighter transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-dark flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-primary">{product.brand}</p>
                        <p className="font-medium text-white">{product.name}</p>
                        {product.featured && (
                          <span className="text-xs text-yellow-500">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">
                      {formatPrice(product.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm ${
                        getTotalStock(product.variants) <= 5
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    >
                      {getTotalStock(product.variants)} unidades
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.active
                          ? "bg-field/20 text-field"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {product.active ? "Activo" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Editar"
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
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </Link>
                      <Link
                        href={`/producto/${product.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Ver en tienda"
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
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
