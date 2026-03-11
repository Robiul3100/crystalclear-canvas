import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
    >
      <Link to={tool.path} className="block group">
        <div className="relative glass-card p-5 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Badge */}
          {tool.badge && (
            <span className={`absolute top-3.5 right-3.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              tool.badge === 'Featured' ? 'gradient-primary text-white' :
              tool.badge === 'Popular' ? 'bg-accent/15 text-accent' :
              'bg-primary/15 text-primary'
            }`}>
              {tool.badge}
            </span>
          )}

          {/* Working indicator */}
          {tool.working && (
            <div className="absolute top-3.5 left-3.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
            </div>
          )}

          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
            tool.working
              ? 'gradient-primary glow-primary group-hover:scale-110'
              : 'bg-secondary group-hover:bg-primary/10'
          }`}>
            <Icon className={`w-6 h-6 transition-colors ${tool.working ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
          </div>

          {/* Content */}
          <h3 className="text-[15px] font-semibold text-foreground mb-1.5 tracking-tight">
            {tool.name}
          </h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {tool.description}
          </p>

          {/* Action */}
          <div className={`flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-300 ${
            tool.working 
              ? 'text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0' 
              : 'text-muted-foreground/50'
          }`}>
            {tool.working ? (
              <>
                <Sparkles className="w-3 h-3" />
                Open Tool
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              'Coming Soon'
            )}
          </div>

          {/* Coming Soon subtle overlay */}
          {!tool.working && (
            <div className="absolute inset-0 bg-background/5 rounded-2xl pointer-events-none" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
