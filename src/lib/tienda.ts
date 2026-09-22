// Datos del negocio, en un solo lugar: los usan la página de Zona Sur, el
// footer y los datos estructurados. Nombre, localidad y teléfono tienen que
// escribirse IGUAL acá, en Instagram y en el Perfil de Empresa de Google:
// para las búsquedas locales, la consistencia vale más que cualquier truco.
export const TIENDA = {
  nombre: "Botinesala Sur",
  localidad: "Llavallol",
  partido: "Lomas de Zamora",
  zona: "Zona Sur del GBA",
  provincia: "Buenos Aires",
  // Calle y número del showroom. Hasta que Alan la confirme, la web dice
  // "a coordinar por WhatsApp" y el Perfil de Empresa puede ir sin dirección
  // visible (negocio con área de servicio).
  direccion: null as string | null,
  // Aproximado al centro de Llavallol; se ajusta con la dirección real
  geo: { lat: -34.7947, lng: -58.4406 },
  whatsapp: "https://wa.me/message/CJPQFIY4XTSJC1",
  instagram: "https://www.instagram.com/botinesalasur/",
  // Dónde llega la moto en el día
  localidadesMoto: [
    "Llavallol", "Lomas de Zamora", "Temperley", "Banfield", "Turdera",
    "Adrogué", "Burzaco", "Lanús", "Monte Grande", "Luis Guillón",
  ],
};
