import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, Upload, Shield, Zap, Layers, ArrowRight, Star, Eraser,
  ImageMinus, ArrowUpFromDot, Crop, Wand2, ChevronRight, Lock
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };
const stagger = { staggerChildren: 0.06 };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const popularTools = tools.filter(t => ['gemini-watermark', 'bg-remover', 'upscaler', 'cartoon', 'compress', 'crop'].includes(t.id));

export default function Home() {
  return (
    <div className="pt-20 pb-8 safe-bottom">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 pill text-[13px]">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-পাওয়ার্ড ইমেজ টুলস প্ল্যাটফর্ম
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            আপনার ইমেজ{' '}
            <span className="gradient-text">ট্রান্সফর্ম</span>
            <br />করুন AI দিয়ে
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            ওয়াটারমার্ক রিমুভ, ব্যাকগ্রাউন্ড রিমুভ, ইমেজ আপস্কেল — সবকিছু এক জায়গায়। সম্পূর্ণ ফ্রি ও প্রাইভেট।
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/watermark-remover"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-[15px] touch-feedback glow-primary"
            >
              <Eraser className="w-5 h-5" />
              ওয়াটারমার্ক রিমুভ করুন
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-foreground font-semibold text-[15px] touch-feedback"
            >
              সব টুলস দেখুন
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-accent" />
              ১০০% প্রাইভেট
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-accent" />
              সুপার ফাস্ট
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-accent" />
              সম্পূর্ণ ফ্রি
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Tool */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-10 overflow-hidden relative"
        >
          <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-5">
              <span className="pill text-xs">
                <Star className="w-3.5 h-3.5 text-primary" />
                Featured Tool
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">
                Gemini <span className="gradient-text">ওয়াটারমার্ক রিমুভার</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                রিভার্স আলফা ব্লেন্ডিং টেকনোলজি ব্যবহার করে Gemini AI দিয়ে তৈরি ইমেজ থেকে ওয়াটারমার্ক মুছুন। সম্পূর্ণ ব্রাউজারে প্রসেস হয়, কোনো ডেটা সার্ভারে যায় না।
              </p>
              <ul className="space-y-2">
                {[
                  { icon: Shield, text: '১০০% প্রাইভেট প্রসেসিং' },
                  { icon: Zap, text: 'মিলিসেকেন্ডে রেজাল্ট' },
                  { icon: Layers, text: 'অরিজিনাল কোয়ালিটি বজায়' },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <f.icon className="w-4 h-4 text-primary" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/watermark-remover"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm touch-feedback"
              >
                <Eraser className="w-4 h-4" />
                এখনই ব্যবহার করুন
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mockup */}
            <div className="flex-1 max-w-sm w-full">
              <div className="solid-card p-4 space-y-3">
                <div className="aspect-video rounded-xl bg-secondary/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground/60">Before / After Preview</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 flex-1 rounded-full gradient-primary" />
                  <div className="h-2 w-1/4 rounded-full bg-secondary" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Popular Tools */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold">জনপ্রিয় টুলস</h2>
            <p className="text-sm text-muted-foreground mt-1">সবচেয়ে বেশি ব্যবহৃত AI ইমেজ টুলস</p>
          </div>
          <Link to="/tools" className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
            সব দেখুন <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {popularTools.map(tool => (
            <motion.div key={tool.id} variants={fadeUp}>
              <ToolCard
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                path={tool.path}
                color={tool.color}
                badge={tool.badge}
                available={tool.available}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold">ক্যাটাগরি</h2>
          <p className="text-sm text-muted-foreground mt-1">আপনার প্রয়োজন অনুযায়ী টুল খুঁজুন</p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {categories.map(cat => (
            <motion.div key={cat.id} variants={fadeUp}>
              <Link
                to={`/categories?cat=${cat.id}`}
                className="block tool-card group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold mb-1">{cat.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Developer Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 text-center space-y-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center glow-primary"
          >
            <span className="text-3xl font-bold text-primary-foreground">R</span>
          </motion.div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Developed & Designed by</p>
            <h3 className="text-2xl font-bold gradient-text">RSF ROBIUL</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            AI ইমেজ টুলস প্ল্যাটফর্ম তৈরি করেছি যাতে সবাই ফ্রিতে প্রফেশনাল মানের ইমেজ এডিটিং করতে পারে।
          </p>
        </motion.div>
      </section>
    </div>
  );
}
