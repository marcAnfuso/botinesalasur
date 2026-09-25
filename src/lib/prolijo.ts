// Lo que la gente escribe en el checkout ("alan forino", "san isidro 1133")
// se guarda prolijo, así el mail, el panel y la etiqueta de envío quedan
// parejos: "Alan Forino", "San Isidro 1133".
const espacios = (s: string) => s.replace(/\s+/g, " ").trim();

const MINUSCULAS = new Set(["de", "del", "la", "las", "los", "y", "e", "el"]);
const inicial = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

export function capitalizar(s: string): string {
  return espacios(s)
    .toLowerCase()
    .split(" ")
    .map((p, i) => {
      if (i > 0 && MINUSCULAS.has(p)) return p;
      // "juan-pablo" y "o'connor" llevan mayúscula después del guion o apóstrofo
      return p.split(/([-'])/).map((t) => (t === "-" || t === "'" ? t : inicial(t))).join("");
    })
    .join(" ");
}

export const nombreProlijo = (s: string) => capitalizar(s);

export const dniProlijo = (s: string) => s.replace(/\D/g, "");

// El navegador acepta "juan@gmail" como email. Acá se exige dominio con
// punto, y se guarda en minúsculas y sin espacios, que es como lo entiende
// Resend y como lo espera MercadoPago. Devuelve null si no sirve.
export function emailProlijo(s: string | undefined | null): string | null {
  const e = (s ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}
