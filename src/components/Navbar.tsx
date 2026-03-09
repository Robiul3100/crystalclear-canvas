import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Sun, Moon, Menu, X, Home, Wrench,
  Grid3X3, ImageIcon, Search
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
  { label: 'হোম', path: '/', icon: Home },
  { label: 'AI Tools', path: '/#tools', icon: Wrench },
  { label: 'ক্যাটাগরি', path: '/#categories', icon: Grid3X3 },
  { label: 'Watermark Remover', path: '/watermark-remover', icon: ImageIcon },
];

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="glass-nav safe-top"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 touch-feedback">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div className="leading-tight">
              <span className="text-[15px] font-bold text-foreground tracking-tight">
                AI <span className="gradient-text">Toolkit</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center touch-feedback"
            >
              <Search className="w-[18px] h-[18px] text-muted-foreground" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center touch-feedback"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={spring}>
                    <Sun className="w-[18px] h-[18px] text-accent" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -180 }} transition={spring}>
                    <Moon className="w-[18px] h-[18px] text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center touch-feedback"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/40 overflow-hidden"
            >
              <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search AI tools..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={spring}
              className="fixed top-0 right-0 bottom-0 w-[280px] z-[70] bg-background border-l border-border safe-top"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-border/40">
                <span className="text-[15px] font-bold gradient-text">Menu</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all ${
                        location.pathname === item.path
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
