import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Clipboard, Shield, Zap, Download, RotateCcw,
  CheckCircle2, X, ChevronRight, Trash2, Sun, Moon, Sparkles,
  Lock, Cpu, Layers, Plus, Share, ChevronDown
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

const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };
const springBouncy = { type: 'spring' as const, stiffness: 400, damping: 25 };

const Index = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [showImageList, setShowImageList] = useState(false);
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
    const filename = file.name.replace(/\.[^.]+$/, '') + '_clean.png';

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
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* iOS-style Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={spring}
          className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border/50"
        >
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={spring}
                className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  Gemini <span className="gradient-text">WR</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="ios-pill"
              >
                <Lock className="w-3 h-3 text-primary" />
                <span className="hidden sm:inline">প্রাইভেট</span>
              </motion.div>

              <motion.button
                whileTap={{ scale: 0.85, rotate: 180 }}
                transition={springBouncy}
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-accent" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 py-4"
              >
                {/* Hero Section */}
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, ...springBouncy }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, ...springBouncy }}
                    className="inline-flex items-center gap-2 ios-pill mb-2"
                  >
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    AI-Powered রিমুভার
                  </motion.div>

                  <h2 className="text-ios-title text-foreground">
                    ওয়াটারমার্ক মুছুন{' '}
                    <span className="gradient-text">এক ক্লিকে</span>
                  </h2>
                  <p className="text-ios-caption max-w-sm mx-auto">
                    Gemini-জেনারেটেড ইমেজ থেকে ওয়াটারমার্ক সম্পূর্ণ ফ্রি ও প্রাইভেটলি রিমুভ করুন
                  </p>
                </motion.div>

                {/* Upload Card */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, ...springBouncy }}
                >
                  <motion.label
                    whileTap={{ scale: 0.98 }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative block cursor-pointer ios-card-elevated p-8 sm:p-12
                      transition-all duration-300
                      ${isDragging ? 'scale-[1.02] ring-2 ring-primary/50' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center gap-5">
                      <motion.div
                        animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                        transition={spring}
                        className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center shadow-xl glow-primary"
                      >
                        <Upload className="w-9 h-9 text-primary-foreground" />
                      </motion.div>

                      <div className="text-center space-y-2">
                        <p className="text-ios-headline text-foreground">
                          ইমেজ আপলোড করুন
                        </p>
                        <p className="text-ios-footnote">
                          JPG, PNG, WebP সাপোর্টেড
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="ios-pill">
                          <ImageIcon className="w-3.5 h-3.5" /> ড্র্যাগ & ড্রপ
                        </span>
                        <span className="ios-pill">
                          <Clipboard className="w-3.5 h-3.5" /> Ctrl+V
                        </span>
                      </div>
                    </div>
                  </motion.label>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, ...springBouncy }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <FeatureItem 
                    icon={<Shield className="w-5 h-5" />} 
                    title="১০০% প্রাইভেট" 
                    desc="সব ব্রাউজারে প্রসেস"
                  />
                  <FeatureItem 
                    icon={<Zap className="w-5 h-5" />} 
                    title="সুপার ফাস্ট" 
                    desc="মিলিসেকেন্ডে রেজাল্ট"
                  />
                  <FeatureItem 
                    icon={<Layers className="w-5 h-5" />} 
                    title="হাই কোয়ালিটি" 
                    desc="লসলেস আউটপুট"
                  />
                </motion.div>

                {/* Developer Credit */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, ...springBouncy }}
                  className="flex justify-center"
                >
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="ios-card-solid px-5 py-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">R</span>
                    </div>
                    <div>
                      <p className="text-ios-footnote">ডেভেলপার</p>
                      <p className="text-sm font-bold gradient-text">RSF ROBIUL</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              /* ====== EDITOR SCREEN ====== */
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="space-y-4"
              >
                {/* Action Bar */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="ios-card-solid p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="ios-btn-ghost text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" /> যোগ করুন
                    </motion.button>
                    <div className="ios-pill">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      {doneCount}/{images.length}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doneCount > 1 && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDownloadAll}
                        className="ios-btn-ghost text-sm"
                      >
                        <Share className="w-4 h-4 mr-1" /> সব
                      </motion.button>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleReset}
                      className="ios-btn-ghost text-sm text-destructive"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Image List (Collapsible on mobile) */}
                {images.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ios-card-solid overflow-hidden"
                  >
                    <button
                      onClick={() => setShowImageList(!showImageList)}
                      className="w-full p-3 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        ইমেজ তালিকা ({images.length})
                      </span>
                      <motion.div animate={{ rotate: showImageList ? 180 : 0 }} transition={spring}>
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {showImageList && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={spring}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                            {images.map((img, idx) => (
                              <ImageThumbnail
                                key={img.id}
                                img={img}
                                isSelected={idx === selectedIdx}
                                onClick={() => { setSelectedIdx(idx); setShowImageList(false); }}
                                onRemove={() => handleRemoveImage(idx)}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Main Preview */}
                <AnimatePresence mode="wait">
                  {selected?.status === 'done' ? (
                    <motion.div
                      key={`done-${selected.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={spring}
                      className="space-y-4"
                    >
                      <BeforeAfterSlider
                        beforeSrc={selected.originalDataUrl}
                        afterSrc={selected.resultDataUrl}
                      />
                      
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, ...spring }}
                        className="flex justify-center"
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => downloadImage(selected.resultDataUrl, selected.filename)}
                          className="ios-btn-primary text-base"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          ডাউনলোড করুন
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  ) : selected?.status === 'processing' ? (
                    <ProcessingOverlay key={`proc-${selected.id}`} />
                  ) : selected?.status === 'error' ? (
                    <motion.div
                      key={`err-${selected.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ios-card-elevated p-12 flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <X className="w-8 h-8 text-destructive" />
                      </div>
                      <p className="text-sm text-destructive text-center">
                        {selected.error || 'কিছু ভুল হয়েছে'}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Drop zone for more */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-4 text-center transition-all
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border/50'}
                  `}
                >
                  <p className="text-ios-footnote flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> আরো ইমেজ ড্রপ করুন
                  </p>
                </motion.div>

                {/* Footer Credit */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center py-2"
                >
                  <p className="text-ios-footnote">
                    Developed by <span className="font-semibold gradient-text">RSF ROBIUL</span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* ====== Sub Components ====== */

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.97 }}
      className="ios-card-solid p-4 flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}

function ImageThumbnail({ 
  img, isSelected, onClick, onRemove 
}: { 
  img: ProcessedImage; isSelected: boolean; onClick: () => void; onRemove: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer
        transition-all ring-2
        ${isSelected ? 'ring-primary shadow-lg' : 'ring-transparent opacity-60'}
      `}
    >
      {img.originalDataUrl ? (
        <img src={img.originalDataUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {img.status === 'done' && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full gradient-bg flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3 text-primary-foreground" />
      </button>
    </motion.div>
  );
}

export default Index;
