import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 50 * 1024 * 1024;

const UploadZone = ({ onFileSelected }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndEmit = useCallback((file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum 50MB.');
      return;
    }
    onFileSelected(file);
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndEmit(file);
  }, [validateAndEmit]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) validateAndEmit(file);
        return;
      }
    }
  }, [validateAndEmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
      onPaste={handlePaste}
      tabIndex={0}
    >
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-4 p-12 cursor-pointer
          rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndEmit(file);
          }}
        />

        <motion.div
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center"
        >
          <Upload className="w-8 h-8 text-primary-foreground" />
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">
            Drop your image here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse · JPG, PNG, WebP up to 50MB
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" /> Drag & Drop
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Clipboard className="w-3.5 h-3.5" /> Paste
          </span>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-destructive font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </label>
    </motion.div>
  );
};

export default UploadZone;
