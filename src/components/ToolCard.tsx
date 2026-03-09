import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  color?: string;
  badge?: string;
  available?: boolean;
}

export default function ToolCard({ icon: Icon, title, description, path, color = 'text-primary', badge, available = false }: ToolCardProps) {
  const Wrapper = available ? Link : 'div';
  const wrapperProps = available ? { to: path } : {};

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Wrapper {...(wrapperProps as any)} className="block tool-card group relative overflow-hidden">
        {badge && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
            {badge}
          </span>
        )}

        <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>

        <h3 className="text-[15px] font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{description}</p>

        <div className={`flex items-center gap-1.5 text-sm font-medium ${available ? 'text-primary' : 'text-muted-foreground/50'}`}>
          <span>{available ? 'ব্যবহার করুন' : 'শীঘ্রই আসছে'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Wrapper>
    </motion.div>
  );
}
