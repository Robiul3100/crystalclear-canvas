import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Upload, Shield, Zap, Layers,
  ChevronRight, Star, Eye, Wrench, CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/lib/tools';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') return tools;
    return tools.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const featuredTool = tools.find(t => t.featured);
  const workingCount = tools.filter(t => t.working).length;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <Navbar />

      <main className="pt-24">
        {/* ═══════ HERO ═══════ */}
        <section className="relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.07] blur-[140px] gradient-primary" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[120px] bg-accent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
            <div className="text-center space-y-7 max-w-3xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <span className="pill text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  All-in-One AI Image Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
              >
                AI দিয়ে ইমেজ{' '}
                <span className="gradient-text">ম্যাজিক</span>
                <br />
                করুন এক ক্লিকে
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
              >
                ওয়াটারমার্ক রিমুভ, ক্রপ, রিসাইজ, কম্প্রেস, কালার এনহ্যান্স এবং আরো অনেক কিছু।
                সম্পূর্ণ ফ্রি এবং প্রাইভেট।
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Link to="/watermark-remover" className="btn-primary text-[15px]">
                  <Upload className="w-5 h-5" />
                  ওয়াটারমার্ক রিমুভ করুন
                </Link>
                <a href="#tools" className="btn-secondary text-[15px]">
                  সব টুলস দেখুন
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-10 pt-4"
              >
                {[
                  { value: `${tools.length}+`, label: 'AI Tools' },
                  { value: `${workingCount}`, label: 'Working', icon: <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> },
                  { value: '100%', label: 'Free & Private' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xl font-bold gradient-text flex items-center justify-center gap-1">{stat.icon}{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════ QUICK ACCESS ═══════ */}
        <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tools.filter(t => t.working).slice(0, 4).map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Link to={tool.path} className="glass-card-hover p-4 flex items-center gap-3 group block">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 glow-primary group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{tool.nameBn}</p>
                      <p className="text-[11px] text-accent font-medium">ব্যবহার করুন →</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ═══════ FEATURED TOOL ═══════ */}
        {featuredTool && (
          <section className="max-w-6xl mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
                  <span className="pill w-fit text-primary">
                    <Star className="w-3.5 h-3.5" />Featured Tool
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Gemini <span className="gradient-text">Watermark Remover</span>
                  </h2>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    রিভার্স আলফা ব্লেন্ডিং টেকনোলজি ব্যবহার করে Gemini AI-এর ওয়াটারমার্ক মুহূর্তে মুছে ফেলুন।
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: <Shield className="w-4 h-4 text-primary" />, text: '১০০% প্রাইভেট - ব্রাউজারে প্রসেসিং' },
                      { icon: <Zap className="w-4 h-4 text-accent" />, text: 'মিলিসেকেন্ডে প্রসেসিং' },
                      { icon: <Layers className="w-4 h-4 text-primary" />, text: 'অরিজিনাল রেজোলিউশন • ব্যাচ সাপোর্ট' },
                    ].map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'hsl(var(--glass-bg))', border: '1px solid hsl(var(--glass-border))' }}>
                          {f.icon}
                        </div>
                        <span className="text-[13px] text-foreground">{f.text}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Link to="/watermark-remover" className="btn-primary w-fit text-[15px]">
                    টুল ওপেন করুন<ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="relative flex items-center justify-center p-8 min-h-[300px]"
                  style={{ background: 'hsl(var(--glass-bg))' }}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full gradient-primary blur-[100px]" />
                  </div>
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                    className="relative z-10 text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-3xl gradient-primary flex items-center justify-center glow-primary">
                      <Eye className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 rounded-full bg-destructive/50" />
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="w-16 h-1.5 rounded-full gradient-primary" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">Before → After</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══════ WORKING TOOLS HIGHLIGHT ═══════ */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
              <Wrench className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-[16px] font-bold text-foreground">
                <span className="gradient-text">{workingCount}টি টুল</span> এখনই ব্যবহার করুন!
              </h3>
              <p className="text-[13px] text-muted-foreground">
                Watermark Remover, Crop, Resize, Rotate, Compress, Sharpen, Color Enhance — সব ফ্রি!
              </p>
            </div>
            <Link to="/watermark-remover" className="btn-primary text-[13px] whitespace-nowrap">
              শুরু করুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ═══════ ALL TOOLS ═══════ */}
        <section id="tools" className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-3 mb-10">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title">
              সকল AI <span className="gradient-text">Image Tools</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-subtitle mx-auto">
              {tools.length}+ পাওয়ারফুল টুলস • {workingCount}টি এখনই কাজ করছে
            </motion.p>
          </div>

          <div id="categories" className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1 mb-8">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-chip whitespace-nowrap ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card p-8 sm:p-12 text-center space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full gradient-primary blur-[100px]" />
            </div>
            <div className="relative z-10 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                এখনই শুরু করুন — <span className="gradient-text">সম্পূর্ণ ফ্রি</span>
              </h2>
              <p className="text-muted-foreground text-[15px] max-w-lg mx-auto">
                কোনো সাইন আপ নেই, কোনো ক্রেডিট কার্ড নেই। শুধু আপনার ইমেজ আপলোড করুন।
              </p>
              <Link to="/watermark-remover" className="btn-primary text-[15px] inline-flex">
                <Upload className="w-5 h-5" />শুরু করুন
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ═══════ DEVELOPER CREDIT ═══════ */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex justify-center">
            <div className="glass-card px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Developed by</p>
                <p className="text-[17px] font-bold gradient-text">RSF ROBIUL</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 ml-2" />
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
