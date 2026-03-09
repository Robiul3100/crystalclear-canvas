import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const steps = [
  'ইমেজ লোড হচ্ছে...',
  'ওয়াটারমার্ক শনাক্ত হচ্ছে...',
  'আলফা ম্যাপ তৈরি হচ্ছে...',
  'রিভার্স ব্লেন্ডিং...',
  'ফাইনাল আউটপুট...',
];

const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };

const ProcessingOverlay = () => {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12 + 4;
        return next >= 95 ? 95 : next;
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStepIdx(Math.min(Math.floor(progress / 20), steps.length - 1));
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={spring}
      className="glass-card p-10 flex flex-col items-center justify-center gap-6"
    >
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <div className="w-full max-w-[240px] space-y-3">
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: '0%' }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }} />
        </div>
        <div className="flex justify-between items-center">
          <motion.p key={stepIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={spring}
            className="text-[13px] text-muted-foreground">
            {steps[stepIdx]}
          </motion.p>
          <span className="text-[13px] font-mono font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-primary" />
        ))}
      </div>
    </motion.div>
  );
};

export default ProcessingOverlay;
