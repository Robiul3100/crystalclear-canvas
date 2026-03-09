import { motion } from 'framer-motion';
import { Sparkles, Heart, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">AI <span className="gradient-text">Toolkit</span></span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              AI-পাওয়ার্ড ইমেজ টুলস প্ল্যাটফর্ম। ওয়াটারমার্ক রিমুভ, ব্যাকগ্রাউন্ড রিমুভ, ইমেজ আপস্কেল এবং আরো অনেক কিছু।
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">টুলস</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/watermark-remover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">ওয়াটারমার্ক রিমুভার</Link>
              <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">সব টুলস</Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">ক্যাটাগরি</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">সম্পর্কে</h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">সম্পূর্ণ ফ্রি</span>
              <span className="text-sm text-muted-foreground">প্রাইভেট প্রসেসিং</span>
              <span className="text-sm text-muted-foreground">কোনো সাইন-আপ নেই</span>
            </nav>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-destructive" /> by <span className="font-semibold gradient-text">RSF ROBIUL</span>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AI Toolkit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
