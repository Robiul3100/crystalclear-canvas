import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles, Sun, Moon, Menu, X, Home, Wrench,
  Grid3X3, Eraser, Search
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
  { label: 'হোম', path: '/', icon: Home },
  { label: 'AI টুলস', path: '/tools', icon: Wrench },
  { label: 'ক্যাটাগরি', path: '/categories', icon: Grid3X3 },
  { label: 'ওয়াটারমার্ক রিমুভার', path: '/watermark-remover', icon: Eraser },
];

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="glass-nav safe-top"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-lg font-bold tracking-tight">
              AI <span className="gradient-text">Toolkit</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={spring}>
                    <Sun className="w-5 h-5 text-accent" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -180 }} transition={spring}>
                    <Moon className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={spring}
              className="fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold gradient-text">মেনু</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all
                        ${location.pathname === item.path
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">R</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Developed by</p>
                    <p className="text-sm font-bold gradient-text">RSF ROBIUL</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
