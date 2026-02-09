import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
}

const BeforeAfterSlider = ({ beforeSrc, afterSrc }: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, x)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 && e.button === 0 && !e.shiftKey) {
      // Pan mode when zoomed
      isPanning.current = true;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    isDragging.current = true;
    updatePosition(e.clientX);
  }, [updatePosition, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isPanning.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoom > 1) {
      isPanning.current = true;
      lastPanPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return;
    }
    isDragging.current = true;
    updatePosition(e.touches[0].clientX);
  }, [updatePosition, zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPanning.current) {
      const dx = e.touches[0].clientX - lastPanPos.current.x;
      const dy = e.touches[0].clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1));
  const handleResetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-3 sm:p-4 space-y-3"
    >
      {/* Labels + Zoom controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">আগে</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">পরে</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-mono text-muted-foreground w-10 text-center">{zoom.toFixed(1)}x</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          {zoom > 1 && (
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video select-none rounded-xl overflow-hidden cursor-col-resize bg-muted/50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: zoom > 1 ? 'grab' : 'col-resize' }}
      >
        {/* After image (full) */}
        <img
          src={afterSrc}
          alt="After"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center',
          }}
        />
        {/* Before image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeSrc}
            alt="Before"
            className="h-full object-contain"
            style={{
              width: `${(100 / position) * 100}%`,
              maxWidth: 'none',
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center',
            }}
            draggable={false}
          />
        </div>
        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground/90 z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full gradient-bg flex items-center justify-center shadow-lg border-2 border-primary-foreground/50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary-foreground">
              <path d="M4 3L1 7L4 11M10 3L13 7L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {zoom > 1 && (
        <p className="text-[10px] text-center text-muted-foreground">
          ড্র্যাগ করে প্যান করুন · Shift+ক্লিক করে স্লাইডার সরান
        </p>
      )}
    </motion.div>
  );
};

export default BeforeAfterSlider;
