"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product, Category } from "@/types";

interface CatalogoClientProps {
  products: Product[];
  categories: Category[];
  brands: string[];
}

export default function CatalogoClient({
  products,
  categories,
  brands,
}: CatalogoClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Sincronizar con URL cuando cambia
  useEffect(() => {
    const categoria = searchParams.get("categoria") || "";
    setSelectedCategory(categoria);
  }, [searchParams]);

  // Obtener todos los talles disponibles
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock > 0) sizes.add(v.size);
      });
    });
    return Array.from(sizes).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.active);

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    if (selectedSize) {
      filtered = filtered.filter((p) =>
        p.variants.some((v) => v.size === selectedSize && v.stock > 0)
      );
    }

    // Ordenar
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [products, selectedCategory, selectedBrand, selectedSize, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedSize("");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory || selectedBrand || selectedSize || sortBy !== "featured";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="display text-4xl md:text-5xl text-white mb-2">Catálogo</h1>
        <p className="text-gray-400">
          {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? "s" : ""} encontrado
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros - Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          {/* Panel propio: sin superficie ni bordes, los filtros flotaban
              sobre el fondo y no se leían como un grupo de opciones. */}
          <div className="sticky top-24 border border-dark-line bg-dark-card">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-dark-line">
              <h2 className="label text-gray-400">Filtrar</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:text-primary-light transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Categoría */}
            <div className="px-4 py-4 border-b border-dark-line">
              <h3 className="label text-gray-500 mb-2.5">Categoría</h3>
              <div className="-mx-2">
                {[{ slug: "", name: "Todas" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))].map(
                  (opcion) => {
                    const activa = selectedCategory === opcion.slug;
                    return (
                      <button
                        key={opcion.slug || "todas"}
                        onClick={() => setSelectedCategory(opcion.slug)}
                        aria-pressed={activa}
                        className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm transition-colors ${
                          activa
                            ? "text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                            activa ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                        {opcion.name}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Marca */}
            <div className="px-4 py-4 border-b border-dark-line">
              <h3 className="label text-gray-500 mb-2.5">Marca</h3>
              <div className="-mx-2">
                {["", ...brands].map((marca) => {
                  const activa = selectedBrand === marca;
                  return (
                    <button
                      key={marca || "todas"}
                      onClick={() => setSelectedBrand(marca)}
                      aria-pressed={activa}
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm transition-colors ${
                        activa
                          ? "text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                          activa ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      {marca || "Todas"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Talle */}
            <div className="px-4 py-4">
              <h3 className="label text-gray-500 mb-2.5">Talle</h3>
              <div className="flex flex-wrap gap-1.5">
                {["", ...allSizes].map((talle) => {
                  const activo = selectedSize === talle;
                  return (
                    <button
                      key={talle || "todos"}
                      onClick={() => setSelectedSize(talle)}
                      aria-pressed={activo}
                      className={`px-2.5 py-1.5 text-xs tnum border transition-colors ${
                        activo
                          ? "bg-primary border-primary text-white"
                          : "border-dark-line text-gray-400 hover:text-white hover:border-gray-600"
                      }`}
                    >
                      {talle || "Todos"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filters Toggle & Sort */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-secondary flex items-center gap-2"
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
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-field w-auto"
            >
              <option value="featured">Destacados</option>
              <option value="newest">Más nuevos</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden border border-dark-line bg-dark-card mb-6 animate-fadeIn">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-dark-line">
                <h2 className="label text-gray-400">Filtrar</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:text-primary-light transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Todas</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Marca
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Todas</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Talle */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Talle
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Todos</option>
                    {allSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-4 py-2 text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-gray-600 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                No encontramos productos
              </h3>
              <p className="text-gray-400 mb-4">
                Probá ajustando los filtros para ver más resultados.
              </p>
              <button
                onClick={clearFilters}
                className="text-primary hover:text-primary-light transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
