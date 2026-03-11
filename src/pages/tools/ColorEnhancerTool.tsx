import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Palette, Check, Sun, Contrast, Droplets } from 'lucide-react';
import ToolLayout, { downloadDataUrl } from '@/components/ToolLayout';

export default function ColorEnhancerTool() {
  return (
    <ToolLayout title="Color" titleHighlight="Enhancer" subtitle="ইমেজের কালার ও ভাইব্রেন্সি বাড়ান">
      {({ image, imageDataUrl, resetImage }) => (
        <ColorEditor image={image} imageDataUrl={imageDataUrl} resetImage={resetImage} />
      )}
    </ToolLayout>
  );
}

function ColorEditor({ image, imageDataUrl, resetImage }: { image: HTMLImageElement; imageDataUrl: string; resetImage: () => void }) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [result, setResult] = useState('');

  const getFilterString = () => {
    const b = 100 + brightness;
    const c = 100 + contrast;
    const s = 100 + saturation;
    return `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
  };

  const applyEnhance = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = getFilterString();
    ctx.drawImage(image, 0, 0);
    setResult(canvas.toDataURL('image/png'));
  };

  const presets = [
    { label: 'ভাইব্র্যান্ট', b: 5, c: 10, s: 40 },
    { label: 'ওয়ার্ম', b: 10, c: 5, s: 15 },
    { label: 'কুল', b: -5, c: 10, s: -10 },
    { label: 'ড্রামাটিক', b: -10, c: 30, s: 20 },
  ];

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="pill text-accent"><Check className="w-3.5 h-3.5" />এনহ্যান্সমেন্ট সম্পন্ন</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setResult(''); resetImage(); }}
            className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
        </div>
        <div className="glass-card overflow-hidden">
          <img src={result} alt="Enhanced" className="w-full object-contain max-h-[60vh]" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => downloadDataUrl(result, 'enhanced.png')}
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
        <img src={imageDataUrl} alt="Preview" className="w-full object-contain max-h-[40vh]"
          style={{ filter: getFilterString() }} />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {presets.map(p => (
          <button key={p.label} onClick={() => { setBrightness(p.b); setContrast(p.c); setSaturation(p.s); }}
            className="category-chip text-[12px] px-3 py-1.5 whitespace-nowrap">{p.label}</button>
        ))}
      </div>

      <div className="glass-card p-5 space-y-4">
        {[
          { label: 'ব্রাইটনেস', icon: <Sun className="w-3.5 h-3.5" />, value: brightness, set: setBrightness },
          { label: 'কন্ট্রাস্ট', icon: <Contrast className="w-3.5 h-3.5" />, value: contrast, set: setContrast },
          { label: 'স্যাচুরেশন', icon: <Droplets className="w-3.5 h-3.5" />, value: saturation, set: setSaturation },
        ].map(ctrl => (
          <div key={ctrl.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">{ctrl.icon}{ctrl.label}</span>
              <span className="text-foreground font-bold">{ctrl.value > 0 ? '+' : ''}{ctrl.value}</span>
            </div>
            <input type="range" min="-50" max="50" value={ctrl.value} onChange={e => ctrl.set(+e.target.value)}
              className="w-full accent-primary" />
          </div>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={applyEnhance}
        className="w-full btn-primary text-[15px] py-3.5 glow-primary">
        <Palette className="w-5 h-5" />এনহ্যান্স করুন
      </motion.button>
    </div>
  );
}
