import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export default function Tools() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = tools.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-20 pb-8 safe-bottom">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">সব AI <span className="gradient-text">ইমেজ টুলস</span></h1>
          <p className="text-muted-foreground max-w-lg mx-auto">আপনার প্রয়োজনীয় AI ইমেজ টুল খুঁজে নিন</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="টুল খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`pill text-[13px] whitespace-nowrap touch-feedback ${activeCategory === 'all' ? 'bg-primary/10 text-primary' : ''}`}
          >
            সব
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pill text-[13px] whitespace-nowrap touch-feedback ${activeCategory === cat.id ? 'bg-primary/10 text-primary' : ''}`}
            >
              {cat.title}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div initial="initial" animate="animate" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(tool => (
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

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">কোনো টুল পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
