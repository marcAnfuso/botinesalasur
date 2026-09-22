// Lo que la gente escribe en el checkout ("alan mariano", "san isidro 1133")
// se guarda prolijo, así el mail, el panel y la etiqueta de envío quedan
// parejos. El nombre va en mayúsculas, como en el DNI y en el correo.
const espacios = (s: string) => s.replace(/\s+/g, " ").trim();

export const nombreProlijo = (s: string) => espacios(s).toUpperCase();

const MINUSCULAS = new Set(["de", "del", "la", "las", "los", "y", "e", "el"]);
export function capitalizar(s: string): string {
  return espacios(s)
    .toLowerCase()
    .split(" ")
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

export const dniProlijo = (s: string) => s.replace(/\D/g, "");
