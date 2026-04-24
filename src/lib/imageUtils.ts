/**
 * Client-side image helpers. We compress uploaded photos before storing them
 * in the Zustand persist layer (localStorage) so the CV data stays well under
 * the ~5MB per-origin quota even for users who upload 5-10MB camera shots.
 *
 * Target: max 500px on the longest side, JPEG quality 0.78. A typical portrait
 * lands around 40-80 KB of base64 this way.
 */
export async function compressImage(
  file: File,
  options: { maxSide?: number; quality?: number } = {}
): Promise<string> {
  const { maxSide = 500, quality = 0.78 } = options;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Falha a ler o ficheiro'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Imagem inválida'));
    image.src = dataUrl;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // fallback: return uncompressed
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // JPEG is much smaller than PNG for photos. Transparent logos should still
  // use PNG, so keep PNG if the file is clearly a logo (square PNG).
  const isLikelyLogo = file.type === 'image/png' && Math.abs(width - height) < 4 && width < 400;
  return canvas.toDataURL(isLikelyLogo ? 'image/png' : 'image/jpeg', quality);
}
