import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
}

const spring = { type: 'spring', stiffness: 400, damping: 30 };

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
    if (zoom > 1 && e.button === 0) {
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
      transition={spring}
      className="ios-card-elevated p-4 space-y-4"
    >
      {/* Header with labels and zoom controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="ios-pill text-xs">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            আগে
          </span>
          <span className="ios-pill text-xs">
            <span className="w-2 h-2 rounded-full bg-primary" />
            পরে
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-2 rounded-lg hover:bg-background/50 transition-colors disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <span className="text-xs font-medium text-foreground w-10 text-center tabular-nums">
            {zoom.toFixed(1)}x
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="p-2 rounded-lg hover:bg-background/50 transition-colors disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          {zoom > 1 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleResetZoom}
              className="p-2 rounded-lg hover:bg-background/50 transition-colors ml-1"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video select-none rounded-2xl overflow-hidden bg-secondary"
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

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
              <path d="M5 4L2 8L5 12M11 4L14 8L11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>

        {/* Before/After overlay labels */}
        <div className="absolute bottom-3 left-3 ios-pill text-[10px] bg-black/50 text-white border-0">
          আগে
        </div>
        <div className="absolute bottom-3 right-3 ios-pill text-[10px] bg-black/50 text-white border-0">
          পরে
        </div>
      </div>

      {/* Zoom hint */}
      {zoom > 1 && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-ios-footnote flex items-center justify-center gap-2"
        >
          <Move className="w-3 h-3" />
          ড্র্যাগ করে প্যান করুন
        </motion.p>
      )}
    </motion.div>
  );
};

export default BeforeAfterSlider;
