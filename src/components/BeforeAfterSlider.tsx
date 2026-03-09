import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
}

const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="ios-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex gap-6">
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">আগে</span>
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">পরে</span>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center touch-feedback disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          
          <span className="text-[12px] font-mono text-muted-foreground w-10 text-center">
            {zoom.toFixed(1)}×
          </span>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="w-8 h-8 rounded-lg flex items-center justify-center touch-feedback disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          
          <AnimatePresence>
            {zoom > 1 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleResetZoom}
                className="w-8 h-8 rounded-lg flex items-center justify-center touch-feedback ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video select-none bg-secondary/30"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: zoom > 1 ? 'grab' : 'col-resize' }}
      >
        {/* After Image (Full) */}
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
        
        {/* Before Image (Clipped) */}
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
        
        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white/90 z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-lg ios-glow-primary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
              <path 
                d="M5 4L2 8L5 12M11 4L14 8L11 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Zoom Hint */}
      <AnimatePresence>
        {zoom > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-secondary/50 text-center"
          >
            <p className="text-[11px] text-muted-foreground">
              ড্র্যাগ করে প্যান করুন • Shift+ক্লিক করে স্লাইডার সরান
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BeforeAfterSlider;
