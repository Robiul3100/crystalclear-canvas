import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export default function Categories() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || categories[0]?.id || '';
  const [activeCat, setActiveCat] = useState(initialCat);

  const categoryTools = tools.filter(t => t.category === activeCat);
  const activeCategory = categories.find(c => c.id === activeCat);

  return (
    <div className="pt-20 pb-8 safe-bottom">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">টুল <span className="gradient-text">ক্যাটাগরি</span></h1>
          <p className="text-muted-foreground">ক্যাটাগরি অনুযায়ী AI ইমেজ টুলস ব্রাউজ করুন</p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-2 pill text-[13px] whitespace-nowrap touch-feedback ${activeCat === cat.id ? 'bg-primary/10 text-primary' : ''}`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.title}
            </button>
          ))}
        </motion.div>

        {/* Active Category Info */}
        {activeCategory && (
          <motion.div key={activeCat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <activeCategory.icon className={`w-7 h-7 ${activeCategory.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{activeCategory.title}</h2>
                <p className="text-sm text-muted-foreground">{activeCategory.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tools Grid */}
        <motion.div key={activeCat} initial="initial" animate="animate" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryTools.map(tool => (
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
      </div>
    </div>
  );
}
