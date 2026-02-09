import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const steps = [
  'ইমেজ লোড হচ্ছে...',
  'ওয়াটারমার্ক শনাক্ত করা হচ্ছে...',
  'আলফা ম্যাপ তৈরি হচ্ছে...',
  'রিভার্স ব্লেন্ডিং চলছে...',
  'ফাইনাল আউটপুট তৈরি হচ্ছে...',
];

const ProcessingOverlay = () => {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15 + 5;
        return next >= 95 ? 95 : next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idx = Math.min(Math.floor(progress / 20), steps.length - 1);
    setStepIdx(idx);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="neo-card p-8 sm:p-12 flex flex-col items-center justify-center gap-6"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg"
      >
        <Sparkles className="w-8 h-8 text-primary-foreground" />
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'var(--gradient-primary)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between items-center">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground"
          >
            {steps[stepIdx]}
          </motion.p>
          <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessingOverlay;
