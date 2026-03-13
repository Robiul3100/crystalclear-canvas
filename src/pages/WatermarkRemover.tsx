import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Clipboard, Download, RotateCcw,
  CheckCircle2, X, Trash2, Plus, Share2, Info, Camera, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadImageFromFile, processImage, downloadImage, ensureAssetsLoaded } from '@/lib/watermarkEngine';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import ProcessingOverlay from '@/components/ProcessingOverlay';
import Navbar from '@/components/Navbar';

interface ProcessedImage {
  id: string;
  filename: string;
  originalDataUrl: string;
  resultDataUrl: string;
  width: number;
  height: number;
  status: 'processing' | 'done' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 50 * 1024 * 1024;
const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };

const WatermarkRemover = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preloadAssets = useCallback(async () => {
    if (!assetsReady) {
      await ensureAssetsLoaded();
      setAssetsReady(true);
    }
  }, [assetsReady]);

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    if (file.size > MAX_SIZE) return;
    await preloadAssets();

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = file.name.replace(/\.[^.]+$/, '') + '_no_watermark.png';

    setImages(prev => {
      const newImages = [...prev, {
        id, filename,
        originalDataUrl: '', resultDataUrl: '',
        width: 0, height: 0,
        status: 'processing' as const,
      }];
      setSelectedIdx(newImages.length - 1);
      return newImages;
    });

    try {
      const img = await loadImageFromFile(file);
      const result = await processImage(img);
      setImages(prev => prev.map(item =>
        item.id === id ? { ...item, ...result, status: 'done' as const } : item
      ));
    } catch (err) {
      setImages(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'error' as const, error: (err as Error).message } : item
      ));
    }
  }, [preloadAssets]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach(f => processFile(f));
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) processFile(file);
      }
    }
  }, [processFile]);

  const handleReset = useCallback(() => {
    setImages([]);
    setSelectedIdx(0);
  }, []);

  const handleRemoveImage = useCallback((idx: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== idx);
      if (selectedIdx >= newImages.length) setSelectedIdx(Math.max(0, newImages.length - 1));
      return newImages;
    });
  }, [selectedIdx]);

  const handleDownloadAll = useCallback(() => {
    images.filter(i => i.status === 'done').forEach((img, idx) => {
      setTimeout(() => downloadImage(img.resultDataUrl, img.filename), idx * 200);
    });
  }, [images]);

  const selected = images[selectedIdx];
  const doneCount = images.filter(i => i.status === 'done').length;
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom" onPaste={handlePaste} tabIndex={0}>
      <Navbar />

      <main className="pt-24 pb-8 px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />

        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <Link to="/" className="btn-ghost text-[13px] px-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              সব টুলস
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {!hasImages ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Gemini <span className="gradient-text">Watermark Remover</span>
                  </h1>
                  <p className="text-[14px] text-muted-foreground">
                    Reverse Alpha Blending • সম্পূর্ণ প্রাইভেট • ব্রাউজারে প্রসেসিং
                  </p>
                </div>

                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="block cursor-pointer"
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                    transition={spring}
                    className={`upload-zone space-y-6 ${isDragging ? 'active' : ''}`}
                  >
                    <motion.div
                      animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                      transition={spring}
                      className="w-20 h-20 mx-auto rounded-[22px] gradient-primary flex items-center justify-center glow-primary"
                    >
                      <Camera className="w-9 h-9 text-primary-foreground" />
                    </motion.div>

                    <div className="space-y-2">
                      <p className="text-[17px] font-semibold text-foreground">
                        Drag & Drop Image or Click to Upload
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        JPG, PNG, WebP • সর্বোচ্চ 50MB
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="pill text-accent"><Upload className="w-3.5 h-3.5" />ড্র্যাগ & ড্রপ</span>
                      <span className="pill text-accent"><ImageIcon className="w-3.5 h-3.5" />ফাইল সিলেক্ট</span>
                      <span className="pill text-accent"><Clipboard className="w-3.5 h-3.5" />পেস্ট (Ctrl+V)</span>
                    </div>
                  </motion.div>
                </label>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-[13px] px-4 py-2.5"
                    >
                      <Plus className="w-4 h-4" />
                      যোগ করুন
                    </motion.button>

                    <span className="pill text-accent">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="font-semibold">{doneCount}/{images.length}</span>
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {doneCount > 1 && (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownloadAll} className="btn-ghost text-[13px]">
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleReset} className="btn-ghost text-[13px] text-destructive">
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {images.map((img, idx) => (
                      <ImageThumb key={img.id} img={img} isSelected={idx === selectedIdx}
                        onClick={() => setSelectedIdx(idx)} onRemove={() => handleRemoveImage(idx)} />
                    ))}
                  </motion.div>
                )}

                {/* Preview */}
                <AnimatePresence mode="wait">
                  {selected?.status === 'done' ? (
                    <motion.div key={`done-${selected.id}`} initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                      transition={spring} className="space-y-4">
                      <BeforeAfterSlider beforeSrc={selected.originalDataUrl} afterSrc={selected.resultDataUrl} />
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => downloadImage(selected.resultDataUrl, selected.filename)}
                        className="w-full btn-primary text-[15px] py-3.5">
                        <Download className="w-5 h-5" />ডাউনলোড করুন
                      </motion.button>
                    </motion.div>
                  ) : selected?.status === 'processing' ? (
                    <ProcessingOverlay key={`proc-${selected.id}`} />
                  ) : selected?.status === 'error' ? (
                    <motion.div key={`err-${selected.id}`} initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                        style={{ background: 'hsl(var(--destructive) / 0.1)' }}>
                        <X className="w-8 h-8 text-destructive" />
                      </div>
                      <p className="text-[15px] text-destructive">{selected.error || 'ত্রুটি ঘটেছে'}</p>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass-card p-12 text-center space-y-4">
                      <Info className="w-12 h-12 mx-auto text-muted-foreground/30" />
                      <p className="text-[15px] text-muted-foreground">একটি ইমেজ সিলেক্ট করুন</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Extra drop zone */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`glass-card p-4 text-center transition-all duration-200 ${isDragging ? 'glow-primary' : ''}`}
                  style={isDragging ? { borderColor: 'hsl(var(--primary))' } : undefined}
                >
                  <p className="text-[13px] text-muted-foreground flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />আরো ইমেজ ড্রপ করুন
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function ImageThumb({
  img, isSelected, onClick, onRemove,
}: {
  img: ProcessedImage;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 touch-feedback
        ${isSelected ? 'ring-[3px] ring-primary glow-primary scale-105' : 'opacity-60 hover:opacity-100'}`}
    >
      {img.originalDataUrl ? (
        <img src={img.originalDataUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: 'hsl(var(--glass-bg))' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {img.status === 'done' && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <motion.button whileTap={{ scale: 0.8 }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        style={{ background: 'hsl(0 0% 0% / 0.6)' }}>
        <Trash2 className="w-3 h-3 text-primary-foreground" />
      </motion.button>
    </motion.div>
  );
}

export default WatermarkRemover;
