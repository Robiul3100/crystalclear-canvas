import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, FileDown, Check, ArrowRight } from 'lucide-react';
import ToolLayout, { downloadDataUrl } from '@/components/ToolLayout';

export default function CompressTool() {
  return (
    <ToolLayout title="Image" titleHighlight="Compressor" subtitle="ইমেজ কম্প্রেস করুন কোয়ালিটি না হারিয়ে">
      {({ image, imageDataUrl, resetImage }) => (
        <CompressEditor image={image} imageDataUrl={imageDataUrl} resetImage={resetImage} />
      )}
    </ToolLayout>
  );
}

function CompressEditor({ image, imageDataUrl, resetImage }: { image: HTMLImageElement; imageDataUrl: string; resetImage: () => void }) {
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'jpeg' | 'webp'>('jpeg');
  const [result, setResult] = useState('');
  const [sizes, setSizes] = useState({ original: 0, compressed: 0 });

  const applyCompress = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d')!.drawImage(image, 0, 0);
    const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100);
    const originalSize = Math.round((imageDataUrl.length * 3) / 4);
    const compressedSize = Math.round((dataUrl.length * 3) / 4);
    setSizes({ original: originalSize, compressed: compressedSize });
    setResult(dataUrl);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const reduction = sizes.original > 0 ? Math.round((1 - sizes.compressed / sizes.original) * 100) : 0;

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="pill text-accent"><Check className="w-3.5 h-3.5" />কম্প্রেশন সম্পন্ন</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setResult(''); resetImage(); }}
            className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-muted-foreground">{formatSize(sizes.original)}</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{formatSize(sizes.compressed)}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${100 - reduction}%` }} />
          </div>
          <p className="text-center text-[13px] font-semibold gradient-text">{reduction}% সাইজ কমেছে</p>
        </div>

        <div className="glass-card overflow-hidden">
          <img src={result} alt="Compressed" className="w-full object-contain max-h-[50vh]" />
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={() => downloadDataUrl(result, `compressed.${format}`)}
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
        <img src={imageDataUrl} alt="Preview" className="w-full object-contain max-h-[40vh]" />
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground font-medium">কোয়ালিটি</span>
            <span className="text-foreground font-bold">{quality}%</span>
          </div>
          <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(+e.target.value)}
            className="w-full accent-primary" />
        </div>

        <div className="space-y-2">
          <span className="text-[12px] text-muted-foreground font-medium">ফরম্যাট</span>
          <div className="flex gap-2">
            {(['jpeg', 'webp'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={`category-chip text-[12px] px-4 py-1.5 uppercase ${format === f ? 'active' : ''}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={applyCompress}
        className="w-full btn-primary text-[15px] py-3.5 glow-primary">
        <FileDown className="w-5 h-5" />কম্প্রেস করুন
      </motion.button>
    </div>
  );
}
