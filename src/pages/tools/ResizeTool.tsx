import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Maximize, Lock, Unlock, Check } from 'lucide-react';
import ToolLayout, { downloadDataUrl } from '@/components/ToolLayout';

export default function ResizeTool() {
  return (
    <ToolLayout title="Image" titleHighlight="Resize" subtitle="ইমেজ রিসাইজ করুন নির্দিষ্ট ডাইমেনশনে">
      {({ image, imageDataUrl, resetImage }) => (
        <ResizeEditor image={image} imageDataUrl={imageDataUrl} resetImage={resetImage} />
      )}
    </ToolLayout>
  );
}

function ResizeEditor({ image, imageDataUrl, resetImage }: { image: HTMLImageElement; imageDataUrl: string; resetImage: () => void }) {
  const origW = image.naturalWidth;
  const origH = image.naturalHeight;
  const [width, setWidth] = useState(origW);
  const [height, setHeight] = useState(origH);
  const [locked, setLocked] = useState(true);
  const [result, setResult] = useState('');

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (locked) setHeight(Math.round((w / origW) * origH));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (locked) setWidth(Math.round((h / origH) * origW));
  };

  const applyResize = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(image, 0, 0, width, height);
    setResult(canvas.toDataURL('image/png'));
  };

  const presets = [
    { label: '50%', w: Math.round(origW * 0.5), h: Math.round(origH * 0.5) },
    { label: '75%', w: Math.round(origW * 0.75), h: Math.round(origH * 0.75) },
    { label: '200%', w: origW * 2, h: origH * 2 },
    { label: 'HD', w: 1920, h: 1080 },
  ];

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="pill text-accent"><Check className="w-3.5 h-3.5" />রিসাইজ সম্পন্ন ({width}×{height})</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setResult(''); resetImage(); }}
            className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
        </div>
        <div className="glass-card overflow-hidden">
          <img src={result} alt="Resized" className="w-full object-contain max-h-[60vh]" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => downloadDataUrl(result, 'resized.png')}
          className="w-full btn-primary text-[15px] py-3.5 glow-primary">
          <Download className="w-5 h-5" />ডাউনলোড করুন
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="pill text-muted-foreground">অরিজিনাল: {origW}×{origH}</span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={resetImage}
          className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
      </div>

      <div className="glass-card overflow-hidden">
        <img src={imageDataUrl} alt="Preview" className="w-full object-contain max-h-[40vh]" />
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Width (px)</label>
            <input type="number" value={width} onChange={e => handleWidthChange(+e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-2.5 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLocked(!locked)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mt-5">
            {locked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
          </motion.button>
          <div className="flex-1 space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Height (px)</label>
            <input type="number" value={height} onChange={e => handleHeightChange(+e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-2.5 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setWidth(p.w); setHeight(p.h); }}
              className="category-chip text-[12px] px-3 py-1.5">{p.label}</button>
          ))}
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={applyResize}
        className="w-full btn-primary text-[15px] py-3.5 glow-primary">
        <Maximize className="w-5 h-5" />রিসাইজ করুন
      </motion.button>
    </div>
  );
}
