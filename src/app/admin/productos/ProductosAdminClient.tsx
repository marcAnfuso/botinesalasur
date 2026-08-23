"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/supabase-data";
import { BulkPriceMode, calcularPrecio } from "@/lib/bulk-price";
import BulkPriceBar from "./BulkPriceBar";

interface ProductosAdminClientProps {
  products: Product[];
  categories: Category[];
}

const totalStock = (variants: { stock: number }[]) =>
  variants.reduce((acc, v) => acc + v.stock, 0);

export default function ProductosAdminClient({
  products,
  categories,
}: ProductosAdminClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showActive, setShowActive] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q);
        const matchesCategory =
          !selectedCategory || product.category === selectedCategory;
        const matchesStatus =
          showActive === "all" ||
          (showActive === "active" && product.active) ||
          (showActive === "inactive" && !product.active);
        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [products, searchTerm, selectedCategory, showActive]
  );

  const seleccionados = useMemo(
    () => filteredProducts.filter((p) => seleccion.has(p.id)),
    [filteredProducts, seleccion]
  );

  const todosVisiblesSeleccionados =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => seleccion.has(p.id));

  const alternar = (id: string) =>
    setSeleccion((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const alternarTodos = () =>
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (todosVisiblesSeleccionados) {
        filteredProducts.forEach((p) => next.delete(p.id));
      } else {
        filteredProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });

  const previsualizar = (mode: BulkPriceMode, value: number, round: boolean) =>
    seleccionados.map((p) => ({
      nombre: p.name,
      antes: p.price,
      despues: calcularPrecio(p.price, mode, value, round),
    }));

  const aplicar = async (
    mode: BulkPriceMode,
    value: number,
    round: boolean
  ) => {
    const res = await fetch("/api/admin/products/bulk-price", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: seleccionados.map((p) => p.id),
        mode,
        value,
        round,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudieron actualizar");

    setSeleccion(new Set());
    router.refresh();
    return data as { actualizados: number; fallidos: number };
  };

  return (
    <div className={seleccionados.length > 0 ? "pb-40 lg:pb-32" : ""}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Productos</h1>
          <p className="text-gray-400 mt-1">
            {filteredProducts.length} producto
            {filteredProducts.length !== 1 ? "s" : ""}
            {filteredProducts.length !== products.length &&
              ` de ${products.length}`}
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Agregar producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-dark-card rounded-lg p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select-field sm:w-48"
          aria-label="Filtrar por categoría"
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
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Ocultos</option>
        </select>
      </div>

      {/* Seleccionar todo: fuera de la tabla, para que exista también en móvil */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between gap-4 mb-3 px-1">
          <label className="flex items-center gap-2.5 text-sm text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={todosVisiblesSeleccionados}
              onChange={alternarTodos}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            Seleccionar los {filteredProducts.length} de la lista
          </label>
          {seleccion.size > 0 && (
            <button
              onClick={() => setSeleccion(new Set())}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="bg-dark-card rounded-lg border border-dark-line py-16 px-6 text-center">
          <p className="text-white font-medium">No hay productos que coincidan</p>
          <p className="text-gray-400 text-sm mt-1.5">
            Probá con otro texto de búsqueda o sacá los filtros de categoría y
            estado.
          </p>
          {(searchTerm || selectedCategory || showActive !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setShowActive("all");
              }}
              className="btn-secondary mt-5"
            >
              Quitar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Móvil y tablet: una tarjeta por producto ── */}
          <ul className="lg:hidden space-y-2">
            {filteredProducts.map((product) => {
              const elegido = seleccion.has(product.id);
              const stock = totalStock(product.variants);
              return (
                <li
                  key={product.id}
                  className={`bg-dark-card rounded-lg border transition-colors ${
                    elegido ? "border-primary" : "border-dark-line"
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    <label className="flex items-start pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={elegido}
                        onChange={() => alternar(product.id)}
                        className="w-5 h-5 accent-primary cursor-pointer"
                        aria-label={`Seleccionar ${product.name}`}
                      />
                    </label>

                    <div className="relative w-16 h-16 rounded overflow-hidden bg-dark shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-primary uppercase tracking-wide">
                        {product.brand}
                      </p>
                      <p className="font-medium text-white leading-tight line-clamp-2">
                        {product.name}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white tnum">
                        {formatPrice(product.price)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            product.active
                              ? "bg-field/15 text-field"
                              : "bg-gray-700/60 text-gray-300"
                          }`}
                        >
                          {product.active ? "Activo" : "Oculto"}
                        </span>
                        <span className="text-gray-400 capitalize">
                          {product.category}
                        </span>
                        <span
                          className={
                            stock <= 5 ? "text-yellow-500" : "text-gray-400"
                          }
                        >
                          {stock} u.
                        </span>
                        {product.featured && (
                          <span className="text-yellow-500">Destacado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-dark-line divide-x divide-dark-line">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="flex-1 py-2.5 text-center text-sm text-gray-300 hover:text-white hover:bg-dark-lighter transition-colors"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/producto/${product.id}`}
                      target="_blank"
                      className="flex-1 py-2.5 text-center text-sm text-gray-300 hover:text-white hover:bg-dark-lighter transition-colors"
                    >
                      Ver en la tienda
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ── Escritorio: tabla ── */}
          <div className="hidden lg:block bg-dark-card rounded-lg border border-dark-line overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-line text-left">
                  <th className="pl-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={todosVisiblesSeleccionados}
                      onChange={alternarTodos}
                      className="w-4 h-4 accent-primary cursor-pointer"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  {["Producto", "Categoría", "Precio", "Stock", "Estado", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-sm font-medium text-gray-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-line">
                {filteredProducts.map((product) => {
                  const elegido = seleccion.has(product.id);
                  const stock = totalStock(product.variants);
                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        elegido ? "bg-primary/5" : "hover:bg-dark-lighter"
                      }`}
                    >
                      <td className="pl-4 py-3">
                        <input
                          type="checkbox"
                          checked={elegido}
                          onChange={() => alternar(product.id)}
                          className="w-4 h-4 accent-primary cursor-pointer"
                          aria-label={`Seleccionar ${product.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-dark shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-primary uppercase tracking-wide">
                              {product.brand}
                            </p>
                            <p className="font-medium text-white line-clamp-1">
                              {product.name}
                            </p>
                            {product.featured && (
                              <span className="text-xs text-yellow-500">
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 capitalize">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 font-medium text-white tnum whitespace-nowrap">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm tnum ${
                            stock <= 5 ? "text-yellow-500" : "text-gray-400"
                          }`}
                        >
                          {stock} u.
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.active
                              ? "bg-field/15 text-field"
                              : "bg-gray-700/60 text-gray-300"
                          }`}
                        >
                          {product.active ? "Activo" : "Oculto"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <svg
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
                            title="Ver en la tienda"
                          >
                            <svg
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <BulkPriceBar
        seleccionados={seleccionados.length}
        onLimpiar={() => setSeleccion(new Set())}
        onPrevisualizar={previsualizar}
        onAplicar={aplicar}
      />
    </div>
  );
}
