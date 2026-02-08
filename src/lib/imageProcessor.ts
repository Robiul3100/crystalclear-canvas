// Reverse alpha blending watermark removal engine
// Formula: Original = (Blended − Overlay * Alpha) / (1 − Alpha)

export interface SelectionRegion {
  type: 'rect' | 'brush';
  mask: boolean[][]; // 2D mask at image resolution
}

export function createEmptyMask(width: number, height: number): boolean[][] {
  return Array.from({ length: height }, () => Array(width).fill(false));
}

export function applyRectToMask(
  mask: boolean[][],
  x1: number, y1: number, x2: number, y2: number
) {
  const minX = Math.max(0, Math.min(x1, x2));
  const maxX = Math.min(mask[0]?.length ?? 0, Math.max(x1, x2));
  const minY = Math.max(0, Math.min(y1, y2));
  const maxY = Math.min(mask.length, Math.max(y1, y2));
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      mask[y][x] = true;
    }
  }
}

export function applyBrushToMask(
  mask: boolean[][],
  cx: number, cy: number, radius: number
) {
  const h = mask.length;
  const w = mask[0]?.length ?? 0;
  const r2 = radius * radius;
  for (let y = Math.max(0, cy - radius); y < Math.min(h, cy + radius + 1); y++) {
    for (let x = Math.max(0, cx - radius); x < Math.min(w, cx + radius + 1); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) {
        mask[y][x] = true;
      }
    }
  }
}

export function removeWatermark(
  imageData: ImageData,
  mask: boolean[][],
  overlayColor: [number, number, number],
  alpha: number
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  const d = result.data;
  const invAlpha = 1 - alpha;

  if (invAlpha < 0.001) return result; // avoid division by zero

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      if (!mask[y]?.[x]) continue;
      const i = (y * imageData.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const blended = d[i + c];
        const restored = (blended - overlayColor[c] * alpha) / invAlpha;
        d[i + c] = Math.max(0, Math.min(255, Math.round(restored)));
      }
    }
  }

  // Edge smoothing pass - blend edges of mask with neighbors
  smoothEdges(result, mask, 2);

  return result;
}

function smoothEdges(imageData: ImageData, mask: boolean[][], radius: number) {
  const { width, height, data } = imageData;
  const original = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y]?.[x]) continue;
      // Check if this is an edge pixel
      let isEdge = false;
      for (let dy = -1; dy <= 1 && !isEdge; dy++) {
        for (let dx = -1; dx <= 1 && !isEdge; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width && !mask[ny][nx]) {
            isEdge = true;
          }
        }
      }
      if (!isEdge) continue;

      // Average with neighbors
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const ni = (ny * width + nx) * 4;
            rSum += original[ni]; gSum += original[ni + 1]; bSum += original[ni + 2];
            count++;
          }
        }
      }
      const i = (y * width + x) * 4;
      data[i] = Math.round((data[i] + rSum / count) / 2);
      data[i + 1] = Math.round((data[i + 1] + gSum / count) / 2);
      data[i + 2] = Math.round((data[i + 2] + bSum / count) / 2);
    }
  }
}

export function autoDetectOverlay(imageData: ImageData): {
  color: [number, number, number];
  suggestedAlpha: number;
  regions: { x: number; y: number; w: number; h: number }[];
} {
  // Simple frequency-based detection: find the most common semi-transparent color
  const { data, width, height } = imageData;
  const colorBuckets = new Map<string, number>();

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 16) * 16;
    const g = Math.round(data[i + 1] / 16) * 16;
    const b = Math.round(data[i + 2] / 16) * 16;
    const key = `${r},${g},${b}`;
    colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
  }

  // Find dominant light color (likely overlay)
  let maxCount = 0;
  let dominantColor: [number, number, number] = [255, 255, 255];
  for (const [key, count] of colorBuckets) {
    const [r, g, b] = key.split(',').map(Number) as [number, number, number];
    const brightness = (r + g + b) / 3;
    if (count > maxCount && brightness > 180) {
      maxCount = count;
      dominantColor = [r, g, b];
    }
  }

  return {
    color: dominantColor,
    suggestedAlpha: 0.3,
    regions: [{ x: 0, y: 0, w: width, h: height }],
  };
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

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, format = 'image/png', quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas to blob failed')),
      format,
      quality
    );
  });
}
