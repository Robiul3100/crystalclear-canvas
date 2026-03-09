import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, text: 'ইমেজ লোড হচ্ছে...', icon: Sparkles },
  { id: 2, text: 'ওয়াটারমার্ক ডিটেক্ট করছে...', icon: Cpu },
  { id: 3, text: 'প্রসেসিং চলছে...', icon: Cpu },
  { id: 4, text: 'ফাইনাল টাচ দিচ্ছে...', icon: CheckCircle2 },
];

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

const ProcessingOverlay = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 95));
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={spring}
      className="ios-card-elevated p-8 sm:p-12"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Icon */}
        <div className="relative">
          {/* Pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 w-20 h-20 rounded-full gradient-bg"
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="absolute inset-0 w-20 h-20 rounded-full gradient-bg"
          />
          
          {/* Main icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="relative w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center shadow-xl glow-primary"
          >
            <CurrentIcon className="w-9 h-9 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ios-headline text-foreground"
          >
            {steps[currentStep].text}
          </motion.p>
          <p className="text-ios-footnote">
            অনুগ্রহ করে অপেক্ষা করুন...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full gradient-bg rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">প্রসেসিং</span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1, ...spring }}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${idx <= currentStep ? 'gradient-bg' : 'bg-secondary'}
              `}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessingOverlay;
