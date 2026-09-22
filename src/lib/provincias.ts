// Provincias con el código que usa Correo Argentino en su API. El nombre es
// lo que se guarda en el pedido y se muestra; el código queda listo para
// cuando la web cotice y genere los envíos sola.
export const PROVINCIAS: { code: string; name: string }[] = [
  { code: "B", name: "Buenos Aires" },
  { code: "C", name: "Ciudad Autónoma de Buenos Aires" },
  { code: "K", name: "Catamarca" },
  { code: "H", name: "Chaco" },
  { code: "U", name: "Chubut" },
  { code: "X", name: "Córdoba" },
  { code: "W", name: "Corrientes" },
  { code: "E", name: "Entre Ríos" },
  { code: "P", name: "Formosa" },
  { code: "Y", name: "Jujuy" },
  { code: "L", name: "La Pampa" },
  { code: "F", name: "La Rioja" },
  { code: "M", name: "Mendoza" },
  { code: "N", name: "Misiones" },
  { code: "Q", name: "Neuquén" },
  { code: "R", name: "Río Negro" },
  { code: "A", name: "Salta" },
  { code: "J", name: "San Juan" },
  { code: "D", name: "San Luis" },
  { code: "Z", name: "Santa Cruz" },
  { code: "S", name: "Santa Fe" },
  { code: "G", name: "Santiago del Estero" },
  { code: "V", name: "Tierra del Fuego" },
  { code: "T", name: "Tucumán" },
];

export function codigoProvincia(nombre: string): string | null {
  const n = nombre.trim().toLowerCase();
  return PROVINCIAS.find((p) => p.name.toLowerCase() === n)?.code ?? null;
}
