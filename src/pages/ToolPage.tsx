import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Bell } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { tools } from '@/lib/tools';

const ToolPage = () => {
  const { toolId } = useParams();
  const tool = tools.find(t => t.path === `/tool/${toolId}`);

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 text-center px-4">
          <p className="text-muted-foreground">Tool not found</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link to="/#tools" className="btn-ghost text-[13px] px-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />সব টুলস
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 sm:p-10 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
              style={{ background: 'hsl(var(--glass-bg))', border: '1px solid hsl(var(--glass-border))' }}
            >
              <Icon className="w-10 h-10 text-muted-foreground" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
              <p className="text-[14px] text-muted-foreground">{tool.description}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-[14px] font-medium gradient-text">Coming Soon</span>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed">
              এই টুলটি বর্তমানে ডেভেলপমেন্টে আছে। খুব শীঘ্রই এটি ব্যবহার করা যাবে।
            </p>

            <motion.button whileTap={{ scale: 0.95 }} className="btn-secondary text-[14px] mx-auto">
              <Bell className="w-4 h-4" />নোটিফিকেশন পান
            </motion.button>

            <Link to="/watermark-remover" className="btn-primary text-[14px] block">
              Watermark Remover ব্যবহার করুন
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ToolPage;
