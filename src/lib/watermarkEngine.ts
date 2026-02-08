/**
 * Gemini Watermark Removal Engine
 * Uses Reverse Alpha Blending: original = (watermarked - α × 255) / (1 - α)
 * Based on pre-captured watermark reference images (bg_48.png, bg_96.png)
 */

// Watermark config
const WATERMARK_CONFIGS = {
  small: { size: 48, padding: 32, asset: '/assets/bg_48.png' },
  large: { size: 96, padding: 64, asset: '/assets/bg_96.png' },
};

const MAX_ALPHA = 0.98;

interface AlphaMapData {
  alphaMap: Float32Array;
  width: number;
  height: number;
}

interface WatermarkPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Load image as HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

// Calculate alpha map from background capture image
function calculateAlphaMap(bgImageData: ImageData): AlphaMapData {
  const { data, width, height } = bgImageData;
  const alphaMap = new Float32Array(width * height);

  for (let i = 0; i < alphaMap.length; i++) {
    const pixelIndex = i * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    // Use max channel normalized to [0, 1]
    const maxChannel = Math.max(r, g, b);
    alphaMap[i] = maxChannel / 255.0;
  }

  return { alphaMap, width, height };
}

// Determine watermark config based on image dimensions
function getWatermarkConfig(imgWidth: number, imgHeight: number) {
  if (imgWidth > 1024 && imgHeight > 1024) {
    return WATERMARK_CONFIGS.large;
  }
  return WATERMARK_CONFIGS.small;
}

// Calculate watermark position (bottom-right corner)
function getWatermarkPosition(
  imgWidth: number,
  imgHeight: number,
  wmSize: number,
  padding: number
): WatermarkPosition {
  return {
    x: imgWidth - wmSize - padding,
    y: imgHeight - wmSize - padding,
    width: wmSize,
    height: wmSize,
  };
}

// Core: reverse alpha blend to remove watermark
function reverseAlphaBlend(
  imageData: ImageData,
  alphaMapData: AlphaMapData,
  position: WatermarkPosition
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  const { data } = result;
  const { alphaMap, width: wmWidth } = alphaMapData;

  for (let row = 0; row < position.height; row++) {
    for (let col = 0; col < position.width; col++) {
      const imgX = position.x + col;
      const imgY = position.y + row;

      if (imgX < 0 || imgX >= imageData.width || imgY < 0 || imgY >= imageData.height) continue;

      const alphaIdx = row * wmWidth + col;
      const alpha = Math.min(alphaMap[alphaIdx], MAX_ALPHA);

      if (alpha < 0.01) continue; // No watermark here

      const pixelIdx = (imgY * imageData.width + imgX) * 4;
      const invAlpha = 1.0 - alpha;

      for (let c = 0; c < 3; c++) {
        const watermarked = data[pixelIdx + c];
        // Formula: original = (watermarked - α × 255) / (1 - α)
        const original = (watermarked - alpha * 255) / invAlpha;
        data[pixelIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
      }
      // Keep alpha channel as-is
    }
  }

  return result;
}

// Pre-loaded assets cache
let assetsCache: {
  small?: AlphaMapData;
  large?: AlphaMapData;
} = {};

async function loadAssets(): Promise<void> {
  const loadAlphaMap = async (src: string): Promise<AlphaMapData> => {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return calculateAlphaMap(imageData);
  };

  const [small, large] = await Promise.all([
    loadAlphaMap(WATERMARK_CONFIGS.small.asset),
    loadAlphaMap(WATERMARK_CONFIGS.large.asset),
  ]);

  assetsCache = { small, large };
}

let assetsLoaded = false;

export async function ensureAssetsLoaded(): Promise<void> {
  if (!assetsLoaded) {
    await loadAssets();
    assetsLoaded = true;
  }
}

// Main processing function
export async function processImage(img: HTMLImageElement): Promise<{
  originalDataUrl: string;
  resultDataUrl: string;
  width: number;
  height: number;
}> {
  await ensureAssetsLoaded();

  const { naturalWidth: w, naturalHeight: h } = img;

  // Draw original to canvas
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const originalDataUrl = canvas.toDataURL('image/png');
  const imageData = ctx.getImageData(0, 0, w, h);

  // Determine config
  const config = getWatermarkConfig(w, h);
  const alphaMapData = w > 1024 && h > 1024 ? assetsCache.large! : assetsCache.small!;
  const position = getWatermarkPosition(w, h, config.size, config.padding);

  // Process
  const resultData = reverseAlphaBlend(imageData, alphaMapData, position);

  // Write result
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = w;
  resultCanvas.height = h;
  resultCanvas.getContext('2d')!.putImageData(resultData, 0, 0);

  return {
    originalDataUrl,
    resultDataUrl: resultCanvas.toDataURL('image/png'),
    width: w,
    height: h,
  };
}

export function downloadImage(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadAllAsZip(
  images: { dataUrl: string; filename: string }[]
): void {
  // Simple download all individually (no zip library needed)
  images.forEach((img, i) => {
    setTimeout(() => downloadImage(img.dataUrl, img.filename), i * 200);
  });
}
