import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Focus, Check } from 'lucide-react';
import ToolLayout, { downloadDataUrl } from '@/components/ToolLayout';

export default function SharpenTool() {
  return (
    <ToolLayout title="Image" titleHighlight="Sharpener" subtitle="ব্লারি ইমেজ শার্প করুন">
      {({ image, imageDataUrl, resetImage }) => (
        <SharpenEditor image={image} imageDataUrl={imageDataUrl} resetImage={resetImage} />
      )}
    </ToolLayout>
  );
}

function applyConvolution(imageData: ImageData, kernel: number[], kernelSize: number): ImageData {
  const { data, width, height } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const half = Math.floor(kernelSize / 2);

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = ((y - half + ky) * width + (x - half + kx)) * 4;
          const w = kernel[ky * kernelSize + kx];
          r += data[px] * w;
          g += data[px + 1] * w;
          b += data[px + 2] * w;
        }
      }
      const idx = (y * width + x) * 4;
      result.data[idx] = Math.max(0, Math.min(255, r));
      result.data[idx + 1] = Math.max(0, Math.min(255, g));
      result.data[idx + 2] = Math.max(0, Math.min(255, b));
    }
  }
  return result;
}

function SharpenEditor({ image, imageDataUrl, resetImage }: { image: HTMLImageElement; imageDataUrl: string; resetImage: () => void }) {
  const [strength, setStrength] = useState(50);
  const [result, setResult] = useState('');

  const applySharpen = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const s = strength / 100;
    const center = 1 + 4 * s;
    const edge = -s;
    const kernel = [
      0, edge, 0,
      edge, center, edge,
      0, edge, 0,
    ];

    const sharpened = applyConvolution(imageData, kernel, 3);
    ctx.putImageData(sharpened, 0, 0);
    setResult(canvas.toDataURL('image/png'));
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="pill text-accent"><Check className="w-3.5 h-3.5" />শার্পেনিং সম্পন্ন</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setResult(''); resetImage(); }}
            className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
        </div>
        <div className="glass-card overflow-hidden">
          <img src={result} alt="Sharpened" className="w-full object-contain max-h-[60vh]" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => downloadDataUrl(result, 'sharpened.png')}
          className="w-full btn-primary text-[15px] py-3.5 glow-primary">
          <Download className="w-5 h-5" />ডাউনলোড করুন
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="pill text-muted-foreground">{image.naturalWidth}×{image.naturalHeight}</span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={resetImage}
          className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
      </div>

      <div className="glass-card overflow-hidden">
        <img src={imageDataUrl} alt="Preview" className="w-full object-contain max-h-[50vh]" />
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground font-medium">শার্পনেস</span>
          <span className="text-foreground font-bold">{strength}%</span>
        </div>
        <input type="range" min="10" max="100" value={strength} onChange={e => setStrength(+e.target.value)}
          className="w-full accent-primary" />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>হালকা</span><span>তীব্র</span>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={applySharpen}
        className="w-full btn-primary text-[15px] py-3.5 glow-primary">
        <Focus className="w-5 h-5" />শার্পেন করুন
      </motion.button>
    </div>
  );
}
