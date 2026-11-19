/** Resize + compress an image in the browser before uploading (max side 1600px, JPEG). */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await loadBitmap(file);
  } catch (err) {
    // Chrome/Edge/Firefox no saben abrir fotos HEIC de iPhone: las convertimos a JPG.
    if (!(await isHeic(file))) throw new Error(`No se pudo abrir la foto "${file.name}".`);
    bitmap = await loadBitmap(await heicToJpeg(file));
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  if ("close" in bitmap) (bitmap as ImageBitmap).close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", quality),
  );
}

async function loadBitmap(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fallback abajo */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Detecta HEIC/HEIF por tipo, extensión o por la cabecera del archivo. */
async function isHeic(file: File) {
  if (/image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) return true;
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const brand = String.fromCharCode(...head.slice(4, 12));
  return brand.startsWith("ftyp") && /hei[cx]|hevc|mif1|msf1/.test(brand.slice(4));
}

async function heicToJpeg(file: File): Promise<Blob> {
  // Se carga solo cuando hace falta (la librería pesa ~1 MB).
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  return Array.isArray(out) ? out[0] : out;
}

/**
 * Si el navegador no puede mostrar la foto (HEIC en Chrome/Windows), la convierte a JPG.
 * Así la vista previa del formulario funciona y la subida es más rápida.
 */
export async function prepareImage(file: File): Promise<File> {
  try {
    const bmp = await loadBitmap(file);
    if ("close" in bmp) (bmp as ImageBitmap).close();
    return file;
  } catch {
    if (!(await isHeic(file))) throw new Error(`No se pudo abrir la foto "${file.name}".`);
    const jpg = await heicToJpeg(file);
    return new File([jpg], file.name.replace(/\.hei[cf]$/i, "") + ".jpg", { type: "image/jpeg" });
  }
}
