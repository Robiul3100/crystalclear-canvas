import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="glass-nav safe-top"
        style={{
          backdropFilter: `blur(${scrolled ? 32 : 24}px) saturate(${scrolled ? 200 : 180}%)`,
          WebkitBackdropFilter: `blur(${scrolled ? 32 : 24}px) saturate(${scrolled ? 200 : 180}%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 touch-feedback">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center glow-primary"
            >
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </motion.div>
            <span className="text-[15px] font-bold text-foreground tracking-tight">
              AI <span className="gradient-text">Toolkit</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'hsl(var(--primary) / 0.08)',
                        border: '1px solid hsl(var(--primary) / 0.12)',
                      }}
                      transition={spring}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center touch-feedback hover:bg-secondary/50 transition-colors"
            >
              <Search className="w-[16px] h-[16px] text-muted-foreground" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center touch-feedback hover:bg-secondary/50 transition-colors"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={spring}>
                    <Sun className="w-[16px] h-[16px] text-accent" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -180 }} transition={spring}>
                    <Moon className="w-[16px] h-[16px] text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center touch-feedback hover:bg-secondary/50 transition-colors"
            >
              <Menu className="w-[18px] h-[18px] text-foreground" />
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
              className="overflow-hidden"
            >
              <div className="max-w-6xl mx-auto px-4 py-2.5">
                <div className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{
                    background: 'hsl(var(--glass-bg))',
                    border: '1px solid hsl(var(--glass-border))',
                  }}
                >
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
              className="fixed inset-0 z-[60]"
              style={{ background: 'hsl(var(--background) / 0.6)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={spring}
              className="fixed top-3 right-3 bottom-3 w-[280px] z-[70] safe-top glass-card overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-border/20">
                <span className="text-[15px] font-bold gradient-text">Menu</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
              <div className="p-3 space-y-0.5">
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all ${
                        location.pathname === item.path
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      style={location.pathname === item.path ? {
                        background: 'hsl(var(--primary) / 0.08)',
                      } : undefined}
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
