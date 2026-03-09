import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Clipboard, Shield, Zap, Download, RotateCcw,
  CheckCircle2, X, ChevronDown, Trash2, Sun, Moon, Sparkles, Code2,
  Lock, Cpu, Eye, ArrowRight, FileImage, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const Index = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [showList, setShowList] = useState(false);
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
    <div className="min-h-screen bg-background transition-colors duration-500" onPaste={handlePaste} tabIndex={0}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-48 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-48 right-1/3 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10">
        {/* ===== HEADER ===== */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-20"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md glow-primary"
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-tight">
                  Gemini<span className="gradient-text"> WR</span>
                </h1>
                <p className="text-[9px] text-muted-foreground leading-none hidden sm:block">Watermark Remover</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground neo-btn px-2.5 py-1.5">
                <Lock className="w-3 h-3 text-primary" />
                <span>ক্লায়েন্ট-সাইড</span>
              </div>

              {/* Theme toggle */}
              <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={toggleTheme}
                className="neo-btn p-2 rounded-xl"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-4 h-4 text-accent" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.header>

        <main className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
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
              /* ====== WELCOME ====== */
              <motion.div
                key="welcome"
                variants={stagger}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8 sm:space-y-10 py-6 sm:py-10"
              >
                {/* Hero */}
                <motion.div variants={fadeUp} className="text-center space-y-4 sm:space-y-5 max-w-xl mx-auto px-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="inline-flex items-center gap-2 neo-btn px-4 py-2 rounded-full text-xs text-muted-foreground mb-2"
                  >
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    রিভার্স আলফা ব্লেন্ডিং অ্যালগরিদম
                  </motion.div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                    Gemini ইমেজ থেকে{' '}
                    <span className="gradient-text">ওয়াটারমার্ক</span>{' '}
                    <br className="hidden sm:block" />
                    <span className="gradient-text">রিমুভ</span> করুন
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                    সম্পূর্ণ ব্রাউজারে লোকাল প্রসেসিং · ফ্রি · দ্রুত · লসলেস
                  </p>
                </motion.div>

                {/* Upload zone */}
                <motion.div variants={fadeUp} className="max-w-lg mx-auto">
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative flex flex-col items-center justify-center gap-5 p-8 sm:p-12 cursor-pointer
                      neo-card transition-all duration-300 group
                      ${isDragging ? 'scale-[1.02] glow-primary' : 'hover:glow-primary'}
                    `}
                  >
                    {/* Gradient border on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 gradient-border" />

                    <motion.div
                      animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                      whileHover={{ scale: 1.08 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-xl glow-primary"
                    >
                      <Upload className="w-8 h-8 sm:w-9 sm:h-9 text-primary-foreground" />
                    </motion.div>

                    <div className="text-center space-y-2">
                      <p className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center gap-2">
                        <FileImage className="w-5 h-5 text-primary" />
                        ইমেজ আপলোড করুন
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        JPG, PNG, WebP · সর্বোচ্চ 50MB
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground neo-btn px-3 py-1.5">
                        <ImageIcon className="w-3 h-3 text-accent" /> ড্র্যাগ & ড্রপ
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground neo-btn px-3 py-1.5">
                        <Clipboard className="w-3 h-3 text-accent" /> Ctrl+V
                      </span>
                    </div>
                  </label>
                </motion.div>

                {/* Steps */}
                <motion.div variants={fadeUp} className="flex justify-center items-center gap-2 sm:gap-4 max-w-md mx-auto px-2">
                  <Step num="1" icon={<FileImage className="w-3.5 h-3.5" />} text="ইমেজ সিলেক্ট" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <Step num="2" icon={<Cpu className="w-3.5 h-3.5" />} text="অটো প্রসেস" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <Step num="3" icon={<Download className="w-3.5 h-3.5" />} text="সেভ করুন" />
                </motion.div>

                {/* Features */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  <FeatureCard icon={<Shield className="w-5 h-5" />} title="প্রাইভেসি ফার্স্ট" desc="সমস্ত প্রসেসিং ব্রাউজারে। কোনো সার্ভারে ডেটা যায় না।" color="primary" />
                  <FeatureCard icon={<Zap className="w-5 h-5" />} title="দ্রুত প্রসেসিং" desc="রিভার্স আলফা ব্লেন্ডিং, মিলিসেকেন্ডে ফলাফল।" color="accent" />
                  <FeatureCard icon={<Layers className="w-5 h-5" />} title="লসলেস কোয়ালিটি" desc="অরিজিনাল রেজোলিউশন সংরক্ষিত, কোনো ব্লার নেই।" color="primary" />
                </motion.div>

                {/* Developer Credit - Iconic */}
                <motion.div
                  variants={fadeUp}
                  className="flex justify-center pt-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="neo-card px-6 py-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md glow-primary">
                      <Code2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Developer</p>
                      <p className="text-sm sm:text-base font-extrabold gradient-text tracking-tight">RSF ROBIUL</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              /* ====== EDITOR ====== */
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Action bar */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs sm:text-sm neo-btn border-0">
                      <Upload className="w-3.5 h-3.5 mr-1 text-primary" /> যোগ করুন
                    </Button>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono font-semibold text-foreground">{doneCount}/{images.length}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    {doneCount > 1 && (
                      <Button variant="outline" size="sm" onClick={handleDownloadAll} className="text-xs sm:text-sm neo-btn border-0">
                        <Download className="w-3.5 h-3.5 mr-1 text-accent" /> সব
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleReset} className="text-xs sm:text-sm neo-btn border-0">
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> রিসেট
                    </Button>
                  </div>
                </motion.div>

                {/* Mobile: image list toggle */}
                {images.length > 1 && (
                  <div className="lg:hidden">
                    <button
                      onClick={() => setShowList(!showList)}
                      className="w-full flex items-center justify-between neo-card p-3"
                    >
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        ইমেজ তালিকা ({images.length})
                      </span>
                      <motion.div animate={{ rotate: showList ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {showList && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide">
                            {images.map((img, idx) => (
                              <Thumbnail
                                key={img.id}
                                img={img}
                                isSelected={idx === selectedIdx}
                                onClick={() => { setSelectedIdx(idx); setShowList(false); }}
                                onRemove={() => handleRemoveImage(idx)}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 sm:gap-6">
                  {/* Preview */}
                  <div className="space-y-3 sm:space-y-4 min-w-0">
                    <AnimatePresence mode="wait">
                      {selected?.status === 'done' ? (
                        <motion.div key={`done-${selected.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <BeforeAfterSlider
                            beforeSrc={selected.originalDataUrl}
                            afterSrc={selected.resultDataUrl}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center mt-3 sm:mt-4"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="gradient-bg text-primary-foreground font-semibold px-6 py-2.5 rounded-xl shadow-lg glow-primary flex items-center gap-2 text-sm sm:text-base"
                              onClick={() => downloadImage(selected.resultDataUrl, selected.filename)}
                            >
                              <Download className="w-4 h-4" /> ডাউনলোড করুন
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      ) : selected?.status === 'processing' ? (
                        <ProcessingOverlay key={`proc-${selected.id}`} />
                      ) : selected?.status === 'error' ? (
                        <motion.div
                          key={`err-${selected.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="neo-card p-12 sm:p-16 flex flex-col items-center justify-center gap-4"
                        >
                          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                            <X className="w-7 h-7 text-destructive" />
                          </div>
                          <p className="text-sm text-destructive text-center">{selected.error || 'ত্রুটি ঘটেছে'}</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="neo-card p-12 sm:p-16 flex flex-col items-center justify-center gap-4"
                        >
                          <Eye className="w-10 h-10 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">একটি ইমেজ সিলেক্ট করুন</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Desktop sidebar */}
                  <div className="hidden lg:block space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      ইমেজ তালিকা
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                      {images.map((img, idx) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedIdx(idx)}
                          className={`
                            relative group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
                            ${idx === selectedIdx
                              ? 'neo-card-inset border border-primary/20'
                              : 'hover:bg-muted/50 border border-transparent'
                            }
                          `}
                        >
                          <div className="w-11 h-11 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {img.originalDataUrl ? (
                              <img src={img.originalDataUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{img.filename}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {img.status === 'done' && <><CheckCircle2 className="w-3 h-3 text-primary" /> সম্পন্ন</>}
                              {img.status === 'processing' && <><Cpu className="w-3 h-3 text-primary animate-spin" /> প্রসেসিং</>}
                              {img.status === 'error' && <><X className="w-3 h-3 text-destructive" /> ত্রুটি</>}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Drop zone */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-3 sm:p-4 text-center transition-all
                    ${isDragging ? 'border-primary bg-primary/5 glow-primary' : 'border-border/50 hover:border-primary/30'}
                  `}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Upload className="w-3.5 h-3.5" /> আরো ইমেজ ড্রপ করুন
                  </p>
                </motion.div>

                {/* Credit */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center pb-2"
                >
                  <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <Code2 className="w-3 h-3 text-primary" />
                    Developed by <span className="font-bold gradient-text">RSF ROBIUL</span>
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

/* ====== Sub-components ====== */

function Step({ num, icon, text }: { num: string; icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl neo-card flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug max-w-[70px] text-center">{text}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: 'primary' | 'accent' }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="neo-card p-4 sm:p-5 space-y-3"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
        {icon}
      </div>
      <h3 className="font-bold text-sm sm:text-base text-foreground">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function Thumbnail({
  img, isSelected, onClick, onRemove,
}: {
  img: ProcessedImage; isSelected: boolean; onClick: () => void; onRemove: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all
        ${isSelected ? 'border-primary shadow-md glow-primary' : 'border-transparent opacity-70'}
      `}
    >
      {img.originalDataUrl ? (
        <img src={img.originalDataUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {img.status === 'done' && (
        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full gradient-bg flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-2.5 h-2.5 text-primary-foreground" />
      </button>
    </motion.div>
  );
}

export default Index;
