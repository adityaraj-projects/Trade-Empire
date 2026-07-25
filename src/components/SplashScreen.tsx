import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-[#07080d] flex flex-col items-center justify-between p-8 overflow-hidden select-none"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[25rem] h-[25rem] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Spacer */}
      <div />

      {/* Center Hero Branding */}
      <div className="flex flex-col items-center text-center relative z-10">
        {/* Floating Animated Logo Badge */}
        <motion.div
          initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-purple-950/80 via-purple-600/30 to-cyan-500/30 border border-purple-400/40 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.45)] backdrop-blur-xl">
            <Crown className="w-12 h-12 md:w-14 md:h-14 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2 rounded-[28px] border border-cyan-400/25 border-dashed pointer-events-none"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight uppercase"
        >
          TRADE EMPIRE
        </motion.h1>

        {/* Entering Tagline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-2 mt-2"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-gray-300">
            ENTERING THE TRADE WORLD...
          </span>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-56 md:w-64 h-1.5 bg-white/5 border border-white/10 rounded-full mt-6 overflow-hidden p-[1px] relative shadow-inner"
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </div>

      {/* Developer Credit Footer */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col items-center gap-1.5 relative z-10 mb-2"
      >
        <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          CRAFTED & DEVELOPED BY
        </span>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-xs md:text-sm font-black tracking-widest bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent uppercase">
            ADITYA RAJ
          </span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </motion.div>
    </motion.div>
  );
};
