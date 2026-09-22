"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function MailPrueba({ porDefecto }: { porDefecto: string }) {
  const [a, setA] = useState(porDefecto);
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();

  const enviar = async () => {
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/mail-prueba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: a }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "No se pudieron mandar");
      toast.success(
        d.fallidos?.length
          ? `Mandados a ${d.a}, salvo: ${d.fallidos.join(", ")}`
          : `Tres mails de prueba mandados a ${d.a}`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudieron mandar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 border-t border-gray-800">
      <label htmlFor="mail-prueba" className="text-sm text-gray-400 sm:w-56 shrink-0">
        Ver cómo llegan los mails
      </label>
      <input
        id="mail-prueba"
        type="email"
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="casilla de destino"
        className="input-field py-2 text-sm flex-1"
      />
      <button
        type="button"
        onClick={enviar}
        disabled={enviando || !a.includes("@")}
        className="btn-secondary py-2 px-4 text-sm disabled:opacity-50 whitespace-nowrap"
      >
        {enviando ? "Mandando…" : "Enviar mails de prueba"}
      </button>
    </div>
  );
}
