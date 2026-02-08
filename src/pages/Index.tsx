import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Eye } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import ImageEditor from '@/components/ImageEditor';
import { loadImageFromFile } from '@/lib/imageProcessor';

const Index = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const img = await loadImageFromFile(file);
      setImage(img);
    } catch {
      console.error('Failed to load image');
    }
    setLoading(false);
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">ClearMark</h1>
                <p className="text-xs text-muted-foreground">Watermark Remover</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Client-Side · No Upload</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 py-12"
              >
                {/* Hero */}
                <div className="text-center space-y-4 max-w-xl mx-auto">
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                    Remove watermarks{' '}
                    <span className="gradient-text">instantly</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Privacy-first image processing. Your images never leave your browser.
                  </p>
                </div>

                <UploadZone onFileSelected={handleFile} />

                {loading && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
                  <FeatureCard
                    icon={<Shield className="w-5 h-5" />}
                    title="Privacy First"
                    desc="All processing happens locally. Zero data sent to servers."
                  />
                  <FeatureCard
                    icon={<Zap className="w-5 h-5" />}
                    title="Instant Processing"
                    desc="Canvas-based reverse alpha blending at full resolution."
                  />
                  <FeatureCard
                    icon={<Eye className="w-5 h-5" />}
                    title="Before & After"
                    desc="Interactive comparison slider to verify results."
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <ImageEditor image={image} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

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
