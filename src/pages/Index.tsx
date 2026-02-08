import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Clipboard, Shield, Zap, Download, RotateCcw, CheckCircle2, Loader2, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadImageFromFile, processImage, downloadImage, ensureAssetsLoaded } from '@/lib/watermarkEngine';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

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

const Index = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preload assets
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
        id,
        filename,
        originalDataUrl: '',
        resultDataUrl: '',
        width: 0,
        height: 0,
        status: 'processing' as const,
      }];
      setSelectedIdx(newImages.length - 1);
      return newImages;
    });

    try {
      const img = await loadImageFromFile(file);
      const result = await processImage(img);

      setImages(prev => prev.map(item =>
        item.id === id
          ? { ...item, ...result, status: 'done' as const }
          : item
      ));
    } catch (err) {
      setImages(prev => prev.map(item =>
        item.id === id
          ? { ...item, status: 'error' as const, error: (err as Error).message }
          : item
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
      className="min-h-screen bg-background"
      onPaste={handlePaste}
      tabIndex={0}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  Gemini<span className="gradient-text"> Watermark Remover</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" />
                <span>100% ক্লায়েন্ট-সাইড · কোনো আপলোড নেই</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {!hasImages ? (
              /* ====== WELCOME SCREEN ====== */
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10 py-8"
              >
                {/* Hero */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
                    Gemini AI ইমেজ থেকে{' '}
                    <span className="gradient-text">ওয়াটারমার্ক রিমুভ</span>{' '}
                    করুন
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    রিভার্স আলফা ব্লেন্ডিং অ্যালগরিদম ব্যবহার করে, সম্পূর্ণ ব্রাউজারে লোকাল প্রসেসিং, ফ্রি, দ্রুত ও লসলেস
                  </p>
                </div>

                {/* Upload zone */}
                <div className="max-w-2xl mx-auto">
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                      relative flex flex-col items-center justify-center gap-4 p-12 cursor-pointer
                      rounded-2xl border-2 border-dashed transition-all duration-300
                      ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(',')}
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleFiles(e.target.files);
                      }}
                    />
                    <motion.div
                      animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                      className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg"
                    >
                      <Upload className="w-8 h-8 text-primary-foreground" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-foreground">
                        ক্লিক করুন অথবা ইমেজ এখানে ড্রাগ করুন
                      </p>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG, WebP সাপোর্ট করে (সর্বোচ্চ 50MB)
                      </p>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <ImageIcon className="w-3.5 h-3.5" /> ড্র্যাগ এন্ড ড্রপ
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <Clipboard className="w-3.5 h-3.5" /> Ctrl+V পেস্ট
                      </span>
                    </div>
                  </label>
                </div>

                {/* Steps */}
                <div className="flex justify-center gap-8 max-w-xl mx-auto text-center">
                  <Step num="1" text="অরিজিনাল ইমেজ সিলেক্ট করুন" />
                  <Step num="2" text="অ্যালগরিদম অটো প্রসেস করবে" />
                  <Step num="3" text="ওয়াটারমার্কমুক্ত ইমেজ সেভ করুন" />
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <FeatureCard
                    icon={<Shield className="w-5 h-5" />}
                    title="প্রাইভেসি ফার্স্ট"
                    desc="সমস্ত প্রসেসিং আপনার ব্রাউজারে হয়। কোনো সার্ভারে ডেটা যায় না।"
                  />
                  <FeatureCard
                    icon={<Zap className="w-5 h-5" />}
                    title="দ্রুত প্রসেসিং"
                    desc="ক্যানভাস ভিত্তিক রিভার্স আলফা ব্লেন্ডিং, মিলিসেকেন্ডে ফলাফল।"
                  />
                  <FeatureCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    title="লসলেস কোয়ালিটি"
                    desc="অরিজিনাল রেজোলিউশন সম্পূর্ণ সংরক্ষিত, কোনো ব্লার নেই।"
                  />
                </div>

                {/* Credit */}
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Developed by <span className="font-semibold gradient-text">RSF ROBIUL</span>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* ====== EDITOR SCREEN ====== */
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Add more / actions bar */}
                <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-1.5" /> আরো ইমেজ যোগ করুন
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(',')}
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleFiles(e.target.files);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      প্রসেস হয়েছে: <span className="font-mono font-semibold text-foreground">{doneCount}/{images.length}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {doneCount > 1 && (
                      <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                        <Download className="w-4 h-4 mr-1.5" /> সব ডাউনলোড
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-1.5" /> রিসেট
                    </Button>
                  </div>
                </div>

                {/* Main content area */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                  {/* Preview area */}
                  <div className="space-y-4">
                    {selected && selected.status === 'done' ? (
                      <>
                        <BeforeAfterSlider
                          beforeSrc={selected.originalDataUrl}
                          afterSrc={selected.resultDataUrl}
                          width={Math.min(800, selected.width)}
                          height={Math.min(600, Math.round(selected.height * Math.min(800, selected.width) / selected.width))}
                        />
                        <div className="flex justify-center gap-3">
                          <Button
                            className="gradient-bg border-0"
                            onClick={() => downloadImage(selected.resultDataUrl, selected.filename)}
                          >
                            <Download className="w-4 h-4 mr-1.5" /> ফলাফল ডাউনলোড করুন
                          </Button>
                        </div>
                      </>
                    ) : selected && selected.status === 'processing' ? (
                      <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground">প্রসেসিং হচ্ছে...</p>
                      </div>
                    ) : selected && selected.status === 'error' ? (
                      <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
                        <X className="w-10 h-10 text-destructive" />
                        <p className="text-destructive">{selected.error || 'ত্রুটি ঘটেছে'}</p>
                      </div>
                    ) : (
                      <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
                        <p className="text-muted-foreground">একটি ইমেজ সিলেক্ট করুন</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail sidebar */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">ইমেজ তালিকা</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedIdx(idx)}
                          className={`
                            relative group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
                            ${idx === selectedIdx
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-muted border border-transparent'
                            }
                          `}
                        >
                          <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {img.originalDataUrl ? (
                              <img src={img.originalDataUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{img.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {img.status === 'done' && <span className="text-primary">✓ সম্পন্ন</span>}
                              {img.status === 'processing' && <span className="text-primary">প্রসেসিং...</span>}
                              {img.status === 'error' && <span className="text-destructive">ত্রুটি</span>}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Drop zone for adding more */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-4 text-center transition-all
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}
                  `}
                >
                  <p className="text-sm text-muted-foreground">
                    আরো ইমেজ এখানে ড্রপ করুন
                  </p>
                </div>

                {/* Credit */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Developed by <span className="font-semibold gradient-text">RSF ROBIUL</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function Step({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md">
        {num}
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{text}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5 space-y-3"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default Index;
