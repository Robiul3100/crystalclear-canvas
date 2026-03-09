import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Clipboard, Shield, Zap, Download, RotateCcw,
  CheckCircle2, X, ChevronRight, Trash2, Sun, Moon, Sparkles,
  Lock, Cpu, Camera, Layers, Plus, Share2, Info
} from 'lucide-react';
import { loadImageFromFile, processImage, downloadImage, ensureAssetsLoaded } from '@/lib/watermarkEngine';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import ProcessingOverlay from '@/components/ProcessingOverlay';
import { useTheme } from '@/hooks/useTheme';

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

const spring = { type: 'spring', stiffness: 500, damping: 30 };

const Index = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

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
    <div 
      className="min-h-screen bg-background transition-colors duration-300 ios-safe-top ios-safe-bottom" 
      onPaste={handlePaste} 
      tabIndex={0}
    >
      {/* iOS-style Navigation Bar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="ios-nav"
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center ios-glow-primary"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold text-foreground tracking-tight">
                Gemini <span className="ios-gradient-text">WR</span>
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="ios-pill text-xs"
            >
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">লোকাল</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center touch-feedback"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={spring}
                  >
                    <Sun className="w-5 h-5 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                    transition={spring}
                  >
                    <Moon className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 pb-8 px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />

        <AnimatePresence mode="wait">
          {!hasImages ? (
            /* ====== WELCOME SCREEN ====== */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg mx-auto space-y-8 py-8"
            >
              {/* Hero */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="inline-flex items-center gap-2 ios-pill text-[13px]"
                >
                  <Cpu className="w-4 h-4 text-primary" />
                  রিভার্স আলফা ব্লেন্ডিং
                </motion.div>

                <h2 className="text-[28px] sm:text-[34px] font-bold text-foreground leading-tight tracking-tight">
                  Gemini ইমেজের{' '}
                  <span className="ios-gradient-text">ওয়াটারমার্ক</span>
                  <br />
                  মুছে ফেলুন
                </h2>
                
                <p className="text-[15px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  সম্পূর্ণ প্রাইভেট • ব্রাউজারে প্রসেসিং • ফ্রি
                </p>
              </motion.div>

              {/* Upload Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
                    className={`
                      ios-card p-8 text-center space-y-5 transition-all duration-200
                      ${isDragging ? 'ios-glow-primary ring-2 ring-primary' : ''}
                    `}
                  >
                    <motion.div
                      animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                      className="w-20 h-20 mx-auto rounded-[22px] gradient-bg flex items-center justify-center ios-glow-primary"
                    >
                      <Camera className="w-9 h-9 text-white" />
                    </motion.div>

                    <div className="space-y-1.5">
                      <p className="text-[17px] font-semibold text-foreground">
                        ইমেজ যোগ করুন
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        JPG, PNG, WebP • সর্বোচ্চ 50MB
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="ios-pill text-[12px]">
                        <ImageIcon className="w-3.5 h-3.5 text-accent" />
                        ড্র্যাগ & ড্রপ
                      </span>
                      <span className="ios-pill text-[12px]">
                        <Clipboard className="w-3.5 h-3.5 text-accent" />
                        পেস্ট (Ctrl+V)
                      </span>
                    </div>
                  </motion.div>
                </label>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="ios-card overflow-hidden"
              >
                <FeatureRow 
                  icon={<Shield className="w-5 h-5 text-primary" />}
                  title="১০০% প্রাইভেট"
                  desc="কোনো ডেটা সার্ভারে যায় না"
                  showDivider
                />
                <FeatureRow 
                  icon={<Zap className="w-5 h-5 text-amber-500" />}
                  title="সুপার ফাস্ট"
                  desc="মিলিসেকেন্ডে রেজাল্ট"
                  showDivider
                />
                <FeatureRow 
                  icon={<Layers className="w-5 h-5 text-accent" />}
                  title="লসলেস কোয়ালিটি"
                  desc="অরিজিনাল রেজোলিউশন বজায়"
                />
              </motion.div>

              {/* Developer Credit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center pt-2"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 ios-card px-5 py-3"
                >
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Developer</p>
                    <p className="text-[15px] font-bold ios-gradient-text">RSF ROBIUL</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            /* ====== EDITOR SCREEN ====== */
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto space-y-4"
            >
              {/* Quick Actions Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="ios-btn-secondary text-[13px] px-4 py-2.5"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    যোগ করুন
                  </motion.button>
                  
                  <div className="ios-pill text-[12px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-semibold">{doneCount}/{images.length}</span>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  {doneCount > 1 && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDownloadAll}
                      className="ios-btn-ghost text-[13px]"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReset}
                    className="ios-btn-ghost text-[13px] text-destructive"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Image Carousel (Mobile) */}
              {images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
                >
                  {images.map((img, idx) => (
                    <ImageThumb
                      key={img.id}
                      img={img}
                      isSelected={idx === selectedIdx}
                      onClick={() => setSelectedIdx(idx)}
                      onRemove={() => handleRemoveImage(idx)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Main Preview */}
              <AnimatePresence mode="wait">
                {selected?.status === 'done' ? (
                  <motion.div
                    key={`done-${selected.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={spring}
                    className="space-y-4"
                  >
                    <BeforeAfterSlider
                      beforeSrc={selected.originalDataUrl}
                      afterSrc={selected.resultDataUrl}
                    />
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadImage(selected.resultDataUrl, selected.filename)}
                      className="w-full ios-btn-primary text-[15px] py-3.5 ios-glow-primary"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      ডাউনলোড করুন
                    </motion.button>
                  </motion.div>
                ) : selected?.status === 'processing' ? (
                  <ProcessingOverlay key={`proc-${selected.id}`} />
                ) : selected?.status === 'error' ? (
                  <motion.div
                    key={`err-${selected.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ios-card p-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                      <X className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="text-[15px] text-destructive">{selected.error || 'ত্রুটি ঘটেছে'}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ios-card p-12 text-center space-y-4"
                  >
                    <Info className="w-12 h-12 mx-auto text-muted-foreground/30" />
                    <p className="text-[15px] text-muted-foreground">একটি ইমেজ সিলেক্ট করুন</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drop Zone */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                  ios-card-inset p-4 text-center transition-all duration-200
                  ${isDragging ? 'ring-2 ring-primary ios-glow-primary' : ''}
                `}
              >
                <p className="text-[13px] text-muted-foreground flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  আরো ইমেজ ড্রপ করুন
                </p>
              </motion.div>

              {/* Footer Credit */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-[12px] text-muted-foreground pt-2"
              >
                Developed by <span className="font-semibold ios-gradient-text">RSF ROBIUL</span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ====== Sub-Components ====== */

function FeatureRow({ 
  icon, title, desc, showDivider 
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  showDivider?: boolean;
}) {
  return (
    <>
      <div className="ios-list-item">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-foreground">{title}</p>
          <p className="text-[13px] text-muted-foreground">{desc}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
      </div>
      {showDivider && <div className="ios-divider" />}
    </>
  );
}

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
      className={`
        relative flex-shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden cursor-pointer 
        transition-all duration-200 touch-feedback
        ${isSelected 
          ? 'ring-[3px] ring-primary ios-glow-primary scale-105' 
          : 'opacity-60 hover:opacity-100'
        }
      `}
    >
      {img.originalDataUrl ? (
        <img src={img.originalDataUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      )}
      
      {img.status === 'done' && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full gradient-bg flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3 text-white" />
      </motion.button>
    </motion.div>
  );
}

export default Index;
