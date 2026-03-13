import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Clipboard,
  Camera, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface ToolLayoutProps {
  title: string;
  titleHighlight: string;
  subtitle: string;
  children: (props: {
    image: HTMLImageElement;
    imageDataUrl: string;
    resetImage: () => void;
  }) => ReactNode;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 50 * 1024 * 1024;
const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };

export default function ToolLayout({ title, titleHighlight, subtitle, children }: ToolLayoutProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_SIZE) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      setImageDataUrl(canvas.toDataURL('image/png'));
      setImage(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  }, [loadFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) loadFile(file);
      }
    }
  }, [loadFile]);

  const resetImage = useCallback(() => {
    setImage(null);
    setImageDataUrl('');
  }, []);

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom" onPaste={handlePaste} tabIndex={0}>
      <Navbar />
      <main className="pt-24 pb-8 px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }}
        />
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <Link to="/" className="btn-ghost text-[13px] px-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              সব টুলস
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div key="upload" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {title} <span className="gradient-text">{titleHighlight}</span>
                  </h1>
                  <p className="text-[14px] text-muted-foreground">{subtitle}</p>
                </div>
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="block cursor-pointer"
                >
                  <motion.div animate={isDragging ? { scale: 1.02 } : { scale: 1 }} transition={spring}
                    className={`upload-zone space-y-6 ${isDragging ? 'active' : ''}`}>
                    
                    {/* Upload icon with glow */}
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
                      <p className="text-[13px] text-muted-foreground">JPG, PNG, WebP • সর্বোচ্চ 50MB</p>
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
              <motion.div key="editor" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                {children({ image, imageDataUrl, resetImage })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
