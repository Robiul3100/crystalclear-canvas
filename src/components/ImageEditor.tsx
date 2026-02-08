import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Square, Paintbrush, RotateCcw, Download, Wand2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  createEmptyMask,
  applyRectToMask,
  applyBrushToMask,
  removeWatermark,
  autoDetectOverlay,
  imageToCanvas,
  canvasToBlob,
} from '@/lib/imageProcessor';
import BeforeAfterSlider from './BeforeAfterSlider';

type Tool = 'none' | 'rect' | 'brush';

interface ImageEditorProps {
  image: HTMLImageElement;
  onReset: () => void;
}

const ImageEditor = ({ image, onReset }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>('rect');
  const [brushSize, setBrushSize] = useState(20);
  const [alpha, setAlpha] = useState(0.3);
  const [overlayColor, setOverlayColor] = useState<[number, number, number]>([255, 255, 255]);
  const [mask, setMask] = useState<boolean[][]>(() => createEmptyMask(image.naturalWidth, image.naturalHeight));
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  const originalCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    originalCanvas.current = imageToCanvas(image);
  }, [image]);

  // Calculate display dimensions
  const maxDisplayWidth = 800;
  const maxDisplayHeight = 600;
  const aspect = image.naturalWidth / image.naturalHeight;
  let displayW = Math.min(maxDisplayWidth, image.naturalWidth);
  let displayH = displayW / aspect;
  if (displayH > maxDisplayHeight) {
    displayH = maxDisplayHeight;
    displayW = displayH * aspect;
  }

  const scaleX = image.naturalWidth / displayW;
  const scaleY = image.naturalHeight / displayH;

  const getImageCoords = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.round(((e.clientX - rect.left) / zoom) * scaleX),
      y: Math.round(((e.clientY - rect.top) / zoom) * scaleY),
    };
  }, [scaleX, scaleY, zoom]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    // Draw mask overlay
    ctx.fillStyle = 'rgba(79, 70, 229, 0.25)';
    for (let y = 0; y < mask.length; y++) {
      for (let x = 0; x < (mask[0]?.length ?? 0); x++) {
        if (mask[y][x]) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, [image, mask]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'none') return;
    setIsDrawing(true);
    const coords = getImageCoords(e);
    if (tool === 'rect') {
      setRectStart(coords);
    } else if (tool === 'brush') {
      const newMask = mask.map(row => [...row]);
      applyBrushToMask(newMask, coords.x, coords.y, brushSize);
      setMask(newMask);
    }
  }, [tool, getImageCoords, mask, brushSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    if (tool === 'brush') {
      const coords = getImageCoords(e);
      setMask(prev => {
        const newMask = prev.map(row => [...row]);
        applyBrushToMask(newMask, coords.x, coords.y, brushSize);
        return newMask;
      });
    }
  }, [isDrawing, tool, getImageCoords, brushSize]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (tool === 'rect' && rectStart) {
      const coords = getImageCoords(e);
      setMask(prev => {
        const newMask = prev.map(row => [...row]);
        applyRectToMask(newMask, rectStart.x, rectStart.y, coords.x, coords.y);
        return newMask;
      });
      setRectStart(null);
    }
  }, [isDrawing, tool, rectStart, getImageCoords]);

  const handleAutoDetect = useCallback(() => {
    if (!originalCanvas.current) return;
    const ctx = originalCanvas.current.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, originalCanvas.current.width, originalCanvas.current.height);
    const result = autoDetectOverlay(imgData);
    setOverlayColor(result.color);
    setAlpha(result.suggestedAlpha);
    // Select detected regions
    const newMask = createEmptyMask(image.naturalWidth, image.naturalHeight);
    for (const r of result.regions) {
      applyRectToMask(newMask, r.x, r.y, r.x + r.w, r.y + r.h);
    }
    setMask(newMask);
  }, [image]);

  const handleProcess = useCallback(() => {
    if (!originalCanvas.current) return;
    setProcessing(true);
    requestAnimationFrame(() => {
      const ctx = originalCanvas.current!.getContext('2d')!;
      const imgData = ctx.getImageData(0, 0, originalCanvas.current!.width, originalCanvas.current!.height);
      const result = removeWatermark(imgData, mask, overlayColor, alpha);

      const outCanvas = document.createElement('canvas');
      outCanvas.width = result.width;
      outCanvas.height = result.height;
      outCanvas.getContext('2d')!.putImageData(result, 0, 0);
      setProcessedDataUrl(outCanvas.toDataURL('image/png'));
      setProcessing(false);
    });
  }, [mask, overlayColor, alpha]);

  const handleDownload = useCallback(async () => {
    if (!processedDataUrl) return;
    const a = document.createElement('a');
    a.href = processedDataUrl;
    a.download = 'cleaned-image.png';
    a.click();
  }, [processedDataUrl]);

  const clearMask = useCallback(() => {
    setMask(createEmptyMask(image.naturalWidth, image.naturalHeight));
    setProcessedDataUrl(null);
  }, [image]);

  const originalDataUrl = originalCanvas.current?.toDataURL('image/png') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Toolbar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          <ToolButton icon={<MousePointer2 className="w-4 h-4" />} label="Select" active={tool === 'none'} onClick={() => setTool('none')} />
          <ToolButton icon={<Square className="w-4 h-4" />} label="Rectangle" active={tool === 'rect'} onClick={() => setTool('rect')} />
          <ToolButton icon={<Paintbrush className="w-4 h-4" />} label="Brush" active={tool === 'brush'} onClick={() => setTool('brush')} />
        </div>

        {tool === 'brush' && (
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Size</span>
            <Slider value={[brushSize]} onValueChange={([v]) => setBrushSize(v)} min={5} max={100} step={1} className="w-24" />
            <span className="text-xs font-mono text-muted-foreground w-8">{brushSize}</span>
          </div>
        )}

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Alpha</span>
          <Slider value={[alpha * 100]} onValueChange={([v]) => setAlpha(v / 100)} min={1} max={99} step={1} className="w-28" />
          <span className="text-xs font-mono text-muted-foreground w-10">{(alpha * 100).toFixed(0)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Color</span>
          <input
            type="color"
            value={`#${overlayColor.map(c => c.toString(16).padStart(2, '0')).join('')}`}
            onChange={(e) => {
              const hex = e.target.value;
              setOverlayColor([
                parseInt(hex.slice(1, 3), 16),
                parseInt(hex.slice(3, 5), 16),
                parseInt(hex.slice(5, 7), 16),
              ]);
            }}
            className="w-8 h-8 rounded-lg border-2 border-border cursor-pointer"
          />
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="flex items-center text-xs font-mono text-muted-foreground px-1 min-w-[40px] justify-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoDetect}>
            <Wand2 className="w-4 h-4 mr-1.5" /> Auto Detect
          </Button>
          <Button variant="outline" size="sm" onClick={clearMask}>
            Clear Selection
          </Button>
          <Button size="sm" className="gradient-bg border-0" onClick={handleProcess} disabled={processing}>
            {processing ? 'Processing…' : 'Remove Watermark'}
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      {!processedDataUrl ? (
        <div className="glass-card p-4 overflow-auto" ref={containerRef}>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
              style={{
                width: displayW * zoom,
                height: displayH * zoom,
                cursor: tool === 'brush' ? 'crosshair' : tool === 'rect' ? 'crosshair' : 'default',
                imageRendering: zoom > 1.5 ? 'pixelated' : 'auto',
              }}
              className="rounded-lg"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Select watermark regions with the rectangle or brush tool, adjust alpha & overlay color, then click "Remove Watermark"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <BeforeAfterSlider
            beforeSrc={originalDataUrl}
            afterSrc={processedDataUrl}
            width={displayW * zoom}
            height={displayH * zoom}
          />
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-1.5" /> New Image
        </Button>
        {processedDataUrl && (
          <>
            <Button variant="outline" onClick={() => setProcessedDataUrl(null)}>
              Back to Editor
            </Button>
            <Button className="gradient-bg border-0" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1.5" /> Download PNG
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background'}
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default ImageEditor;
