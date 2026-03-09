import { motion } from 'framer-motion';
import { Sparkles, Heart, Github, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const toolLinks = [
  { label: 'Watermark Remover', path: '/watermark-remover' },
  { label: 'Background Remover', path: '/tool/background-remover' },
  { label: 'AI Upscaler', path: '/tool/ai-upscaler' },
  { label: 'Image Compressor', path: '/tool/compress' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50 safe-bottom">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-foreground">
                AI <span className="gradient-text">Toolkit</span>
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              All-in-One AI Image Tools Platform. 100% free, private, browser-based.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Tools</h4>
            <div className="space-y-2">
              {toolLinks.map(link => (
                <Link key={link.path} to={link.path} className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Platform</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/#tools" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">All Tools</Link>
              <Link to="/#categories" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Connect</h4>
            <div className="flex gap-2">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center touch-feedback hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-destructive" /> by
            <span className="font-semibold gradient-text">RSF ROBIUL</span>
          </p>
          <p className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} AI Image Toolkit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
