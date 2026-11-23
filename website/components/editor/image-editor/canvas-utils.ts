/** Shared helpers for the crop and draw tabs. */
export interface CropRect {
  /** All values are 0..1 relative to the source image. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ASPECT_PRESETS = [
  { id: "free", label: "Свободно", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "21:8", label: "21:8", ratio: 21 / 8 },
] as const;

export type AspectPresetId = (typeof ASPECT_PRESETS)[number]["id"];

/**
 * Given a source image's natural size and a target aspect ratio, produce
 * the largest centered rectangle that fits. Returns a CropRect in 0..1
 * coordinates.
 */
export function fitRectForAspect(
  natW: number,
  natH: number,
  aspect: number | null,
): CropRect {
  if (!aspect) return { x: 0, y: 0, width: 1, height: 1 };
  const srcAspect = natW / natH;
  if (srcAspect > aspect) {
    // Source is wider - crop sides.
    const w = aspect / srcAspect;
    return { x: (1 - w) / 2, y: 0, width: w, height: 1 };
  }
  const h = srcAspect / aspect;
  return { x: 0, y: (1 - h) / 2, width: 1, height: h };
}

/**
 * Draw the source image to a canvas with the given crop rect applied.
 * Returns a Blob ready for upload.
 */
export async function exportCroppedImage(
  img: HTMLImageElement,
  crop: CropRect,
  mime = "image/png",
  quality = 0.92,
): Promise<Blob> {
  const sx = Math.round(crop.x * img.naturalWidth);
  const sy = Math.round(crop.y * img.naturalHeight);
  const sw = Math.round(crop.width * img.naturalWidth);
  const sh = Math.round(crop.height * img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      mime,
      quality,
    ),
  );
}

/** Load an image from a URL into an HTMLImageElement with CORS. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/** Read a File as a data URL. */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
