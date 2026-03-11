import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Check } from 'lucide-react';
import ToolLayout, { downloadDataUrl } from '@/components/ToolLayout';

export default function RotateTool() {
  return (
    <ToolLayout title="Image" titleHighlight="Rotate & Flip" subtitle="ইমেজ ঘোরান এবং ফ্লিপ করুন">
      {({ image, imageDataUrl, resetImage }) => (
        <RotateEditor image={image} resetImage={resetImage} />
      )}
    </ToolLayout>
  );
}

function RotateEditor({ image, resetImage }: { image: HTMLImageElement; resetImage: () => void }) {
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [result, setResult] = useState('');
  const previewRef = useRef<HTMLCanvasElement>(null);

  const drawPreview = () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const maxW = Math.min(600, window.innerWidth - 32);
    const isRotated = rotation % 180 !== 0;
    const srcW = isRotated ? image.naturalHeight : image.naturalWidth;
    const srcH = isRotated ? image.naturalWidth : image.naturalHeight;
    const scale = maxW / srcW;
    canvas.width = srcW * scale;
    canvas.height = srcH * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2, image.naturalWidth * scale, image.naturalHeight * scale);
    ctx.restore();
  };

  useEffect(() => { drawPreview(); }, [rotation, flipH, flipV, image]);

  const applyTransform = () => {
    const isRotated = rotation % 180 !== 0;
    const w = isRotated ? image.naturalHeight : image.naturalWidth;
    const h = isRotated ? image.naturalWidth : image.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(w / 2, h / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    setResult(canvas.toDataURL('image/png'));
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="pill text-accent"><Check className="w-3.5 h-3.5" />ট্রান্সফর্ম সম্পন্ন</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setResult(''); resetImage(); }}
            className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
        </div>
        <div className="glass-card overflow-hidden">
          <img src={result} alt="Rotated" className="w-full object-contain max-h-[60vh]" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => downloadDataUrl(result, 'rotated.png')}
          className="w-full btn-primary text-[15px] py-3.5 glow-primary">
          <Download className="w-5 h-5" />ডাউনলোড করুন
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="pill text-muted-foreground">{rotation}° {flipH ? '| H-Flip' : ''} {flipV ? '| V-Flip' : ''}</span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={resetImage}
          className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
      </div>

      <div className="glass-card overflow-hidden flex items-center justify-center bg-secondary/30 min-h-[200px]">
        <canvas ref={previewRef} className="max-w-full max-h-[50vh] object-contain" />
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            className="btn-secondary text-[13px] px-4 py-2.5"><RotateCcw className="w-4 h-4" />-90°</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRotation((r) => (r + 90) % 360)}
            className="btn-secondary text-[13px] px-4 py-2.5"><RotateCw className="w-4 h-4" />+90°</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFlipH(f => !f)}
            className={`btn-secondary text-[13px] px-4 py-2.5 ${flipH ? 'ring-2 ring-primary' : ''}`}><FlipHorizontal className="w-4 h-4" /></motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFlipV(f => !f)}
            className={`btn-secondary text-[13px] px-4 py-2.5 ${flipV ? 'ring-2 ring-primary' : ''}`}><FlipVertical className="w-4 h-4" /></motion.button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-[12px] text-muted-foreground">কাস্টম অ্যাঙ্গেল: {rotation}°</label>
          <input type="range" min="0" max="360" value={rotation} onChange={e => setRotation(+e.target.value)}
            className="w-full accent-primary" />
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={applyTransform}
        className="w-full btn-primary text-[15px] py-3.5 glow-primary">
        <RotateCw className="w-5 h-5" />ট্রান্সফর্ম করুন
      </motion.button>
    </div>
  );
}
