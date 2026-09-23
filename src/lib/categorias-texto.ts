// Texto propio de cada categoría: es lo que la diferencia de un listado
// pelado para Google, y lo que le explica al que llega qué suela le sirve.
export const CATEGORIAS_TEXTO: Record<string, { titulo: string; intro: string; descripcion: string }> = {
  futsal: {
    titulo: "Botines de fútsal",
    intro:
      "Suela lisa de goma para parquet, cemento y canchas de fútbol 5 techadas: agarre sin tapones y un botín bajo, pegado al pie, para tocar la pelota. Nike, Adidas, Joma y Umbro, con stock real por talle.",
    descripcion:
      "Botines de fútsal con suela lisa para parquet y cemento. Nike, Adidas, Joma y Umbro con stock por talle, envíos a todo el país y showroom en Llavallol.",
  },
  sintetico: {
    titulo: "Botines para sintético (fútbol 5)",
    intro:
      "Tapones cortos y muchos, de goma, para césped sintético (los de fútbol 5 y 7 al aire libre): agarran sin clavarse y no castigan la rodilla. Es el botín que más se usa en Zona Sur.",
    descripcion:
      "Botines para fútbol 5 en césped sintético, con tapones cortos de goma. Nike, Adidas y más, stock por talle, envíos a todo el país y showroom en Llavallol.",
  },
  futbol11: {
    titulo: "Botines de fútbol 11",
    intro:
      "Tapones altos, moldeados o intercambiables, para césped natural: los de la cancha de once. Si jugás en sintético, mirá la categoría de sintético; acá van los de campo.",
    descripcion:
      "Botines de fútbol 11 para césped natural, con tapones moldeados o intercambiables. Stock por talle, envíos a todo el país y showroom en Llavallol.",
  },
  accesorios: {
    titulo: "Accesorios",
    intro: "Medias, canilleras y lo que hace falta para completar el equipo.",
    descripcion: "Medias, canilleras y accesorios de fútbol. Envíos a todo el país y showroom en Llavallol.",
  },
};
