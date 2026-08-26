// Prepara una foto en el navegador antes de subirla.
//
// Las fotos de celular pesan entre 3 y 10 MB y miden 4000 px de lado: el
// servidor las rechaza por tamaño y Vercel corta el pedido antes de que
// llegue. Acá se achican a un máximo de 1600 px y se recomprimen, lo que
// deja archivos de 150-400 KB que además cargan rápido en la tienda.

const LADO_MAXIMO = 1600;
const CALIDAD = 0.86;

export interface ImagenPreparada {
  file: File;
  anchoOriginal: number;
  altoOriginal: number;
  ancho: number;
  alto: number;
  pesoOriginal: number;
}

function esHeic(file: File): boolean {
  const t = file.type.toLowerCase();
  const n = file.name.toLowerCase();
  return t.includes("heic") || t.includes("heif") || n.endsWith(".heic") || n.endsWith(".heif");
}

async function decodificar(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      // Respeta la orientación EXIF: sin esto las fotos de celular salen giradas
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // cae al <img>
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("no se pudo decodificar"));
    };
    img.src = url;
  });
}

export async function prepararImagen(file: File): Promise<ImagenPreparada> {
  // Los GIF animados se dejan como están: pasarlos por canvas los congela.
  if (file.type === "image/gif") {
    return {
      file,
      anchoOriginal: 0,
      altoOriginal: 0,
      ancho: 0,
      alto: 0,
      pesoOriginal: file.size,
    };
  }

  let fuente: ImageBitmap | HTMLImageElement;
  try {
    fuente = await decodificar(file);
  } catch {
    if (esHeic(file)) {
      throw new Error(
        "Esa foto está en formato HEIC y este navegador no lo puede abrir. En el celular, compartila como JPG o cambiá en Cámara → Formatos → Más compatible."
      );
    }
    throw new Error("No se pudo abrir la imagen. Probá con un JPG o PNG.");
  }

  const anchoOriginal = fuente.width;
  const altoOriginal = fuente.height;
  const escala = Math.min(1, LADO_MAXIMO / Math.max(anchoOriginal, altoOriginal));
  const ancho = Math.round(anchoOriginal * escala);
  const alto = Math.round(altoOriginal * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  // Fondo blanco: un PNG con transparencia recomprimido a JPEG saldría negro
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(fuente, 0, 0, ancho, alto);
  if ("close" in fuente) fuente.close();

  // PNG chico y sin escalar se conserva (logos, recortes con transparencia);
  // todo lo demás va a JPEG, que para fotos de producto es lo que conviene.
  const conservarPng = file.type === "image/png" && escala === 1 && file.size < 800 * 1024;
  const tipo = conservarPng ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, tipo, tipo === "image/jpeg" ? CALIDAD : undefined)
  );
  if (!blob) throw new Error("No se pudo procesar la imagen.");

  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  const nombre = `${base}.${tipo === "image/png" ? "png" : "jpg"}`;

  return {
    file: new File([blob], nombre, { type: tipo }),
    anchoOriginal,
    altoOriginal,
    ancho,
    alto,
    pesoOriginal: file.size,
  };
}
