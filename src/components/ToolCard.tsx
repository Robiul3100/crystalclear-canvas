import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ToolDef } from '@/lib/tools';

interface ToolCardProps {
  tool: ToolDef;
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link to={tool.path} className="block">
        <div className="tool-card group relative overflow-hidden">
          {/* Badge */}
          {tool.badge && (
            <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              tool.badge === 'Featured' ? 'gradient-primary text-white' :
              tool.badge === 'Popular' ? 'bg-accent/15 text-accent' :
              'bg-primary/15 text-primary'
            }`}>
              {tool.badge}
            </span>
          )}

          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
            tool.working
              ? 'gradient-primary glow-primary'
              : 'bg-secondary group-hover:bg-primary/10'
          }`}>
            <Icon className={`w-6 h-6 ${tool.working ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
          </div>

          {/* Content */}
          <h3 className="text-[15px] font-semibold text-foreground mb-1 group-hover:gradient-text transition-all">
            {tool.name}
          </h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
            {tool.description}
          </p>

          {/* Action */}
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            {tool.working ? 'Open Tool' : 'Coming Soon'}
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          {/* Coming Soon Overlay */}
          {!tool.working && (
            <div className="absolute inset-0 bg-background/5 rounded-2xl" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
