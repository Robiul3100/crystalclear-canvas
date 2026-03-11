import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Crop, Check } from 'lucide-react';
import ToolLayout, { downloadDataUrl } from '@/components/ToolLayout';

const PRESETS = [
  { label: 'Free', ratio: 0 },
  { label: '1:1', ratio: 1 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '9:16', ratio: 9 / 16 },
];

export default function CropTool() {
  return (
    <ToolLayout title="Image" titleHighlight="Crop" subtitle="ইমেজ ক্রপ করুন যেকোনো সাইজে">
      {({ image, imageDataUrl, resetImage }) => (
        <CropEditor image={image} imageDataUrl={imageDataUrl} resetImage={resetImage} />
      )}
    </ToolLayout>
  );
}

function CropEditor({ image, imageDataUrl, resetImage }: { image: HTMLImageElement; imageDataUrl: string; resetImage: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [preset, setPreset] = useState(0);
  const [result, setResult] = useState('');
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxW = Math.min(600, window.innerWidth - 32);
    const scale = maxW / image.naturalWidth;
    const displayW = image.naturalWidth * scale;
    const displayH = image.naturalHeight * scale;
    canvas.width = displayW;
    canvas.height = displayH;
    setDisplayScale(scale);
    setCrop({ x: 0, y: 0, w: displayW, h: displayH });
    drawCanvas(canvas, image, { x: 0, y: 0, w: displayW, h: displayH }, scale);
  }, [image]);

  const drawCanvas = (canvas: HTMLCanvasElement, img: HTMLImageElement, c: typeof crop, scale: number) => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, c.y);
    ctx.fillRect(0, c.y + c.h, canvas.width, canvas.height - c.y - c.h);
    ctx.fillRect(0, c.y, c.x, c.h);
    ctx.fillRect(c.x + c.w, c.y, canvas.width - c.x - c.w, c.h);
    // Border
    ctx.strokeStyle = 'hsl(250, 100%, 65%)';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(c.x + (c.w / 3) * i, c.y);
      ctx.lineTo(c.x + (c.w / 3) * i, c.y + c.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + (c.h / 3) * i);
      ctx.lineTo(c.x + c.w, c.y + (c.h / 3) * i);
      ctx.stroke();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragging(true);
    setStartPos({ x, y });
    setCrop({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x2 = Math.max(0, Math.min(canvasRef.current.width, e.clientX - rect.left));
    let y2 = Math.max(0, Math.min(canvasRef.current.height, e.clientY - rect.top));
    let w = x2 - startPos.x;
    let h = y2 - startPos.y;
    if (preset > 0) {
      h = w / preset;
    }
    const newCrop = {
      x: w > 0 ? startPos.x : startPos.x + w,
      y: h > 0 ? startPos.y : startPos.y + h,
      w: Math.abs(w),
      h: Math.abs(h),
    };
    setCrop(newCrop);
    drawCanvas(canvasRef.current, image, newCrop, displayScale);
  };

  const handleMouseUp = () => setDragging(false);

  const applyCrop = () => {
    const scale = 1 / displayScale;
    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const sw = crop.w * scale;
    const sh = crop.h * scale;
    if (sw < 1 || sh < 1) return;
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext('2d')!.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    setResult(canvas.toDataURL('image/png'));
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="pill text-accent"><Check className="w-3.5 h-3.5" />ক্রপ সম্পন্ন</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setResult(''); resetImage(); }}
            className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
        </div>
        <div className="glass-card overflow-hidden">
          <img src={result} alt="Cropped" className="w-full object-contain max-h-[60vh]" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => downloadDataUrl(result, 'cropped.png')}
          className="w-full btn-primary text-[15px] py-3.5 glow-primary">
          <Download className="w-5 h-5" />ডাউনলোড করুন
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => setPreset(p.ratio)}
              className={`category-chip text-[12px] px-3 py-1.5 ${preset === p.ratio ? 'active' : ''}`}>
              {p.label}
            </button>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={resetImage}
          className="btn-ghost text-[13px] text-destructive"><RotateCcw className="w-4 h-4" /></motion.button>
      </div>
      <div className="glass-card overflow-hidden">
        <canvas ref={canvasRef} className="w-full cursor-crosshair"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
      </div>
      <p className="text-[12px] text-muted-foreground text-center">মাউস ড্র্যাগ করে ক্রপ এরিয়া সিলেক্ট করুন</p>
      <motion.button whileTap={{ scale: 0.95 }} onClick={applyCrop}
        className="w-full btn-primary text-[15px] py-3.5 glow-primary">
        <Crop className="w-5 h-5" />ক্রপ করুন
      </motion.button>
    </div>
  );
}
