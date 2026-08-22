"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo iniciar sesión");
        setPassword("");
        return;
      }

      // La cookie la escribe el servidor: sólo hay que navegar.
      const next = searchParams.get("next");
      const target = next && next.startsWith("/admin") ? next : "/admin";
      router.push(target);
      router.refresh();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-card rounded-xl p-6">
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-400 mb-2"
        >
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="Ingresá la contraseña"
          autoComplete="current-password"
          autoFocus
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        className="btn-primary w-full disabled:opacity-50"
        disabled={isSubmitting || password.length === 0}
      >
        {isSubmitting ? "Verificando..." : "Ingresar"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold text-xl">BAS</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
          <p className="text-gray-400 mt-2">Botinesala Sur</p>
        </div>

        <Suspense
          fallback={<div className="bg-dark-card rounded-xl p-6 h-40" />}
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-gray-500 text-sm mt-4">
          <Link href="/" className="hover:text-white transition-colors">
            Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
