import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageSquare, Calendar, Upload, Users, TrendingUp, Zap, Bot, Settings, LogOut, CreditCard, Book } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function MobileMenu({ currentPath }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
    { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
    { icon: Upload, label: 'Menu Manager', path: '/menu' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
    { icon: Zap, label: 'Analytics', path: '/analytics' },
    { icon: Bot, label: 'Assistant IA', path: '/ai-assistant' },
    { icon: Book, label: 'Guide d\'utilisation', path: '/tutorial' },
    { icon: CreditCard, label: 'Paiements', path: '/payment' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  const handleNavigate = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button - Animated */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 rounded-xl glass flex items-center justify-center text-white hover:bg-white/10 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />

            {/* Menu Sidebar - Smooth slide animation */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200,
                opacity: { duration: 0.2 }
              }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] glass border-r border-white/10 p-6 z-50 overflow-y-auto"
            >
              {/* Logo */}
              <div className="mb-8 pt-16">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ReplyFast AI
                </h1>
                <p className="text-gray-400 text-sm mt-1">Dashboard</p>
              </div>

              {/* Navigation - Staggered sequential animation */}
              <nav className="space-y-2">
                {menuItems.map((item, i) => {
                  const isActive = currentPath === item.path;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -30, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        delay: i * 0.08,
                        type: 'spring',
                        damping: 15,
                        stiffness: 200
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: i * 0.08 + 0.1, type: 'spring', damping: 12 }}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Logout Button - Fades in last */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: menuItems.length * 0.08 + 0.2,
                  type: 'spring',
                  damping: 15
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
