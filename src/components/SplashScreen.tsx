import React, { useEffect, useState, useRef } from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000; // Exactly 5 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          onCompleteRef.current();
        }, 200);
      }
    }, 40);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07080d] flex flex-col items-center justify-between p-8 overflow-hidden select-none animate-fade-in">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Spacer */}
      <div />

      {/* Center Hero Branding */}
      <div className="flex flex-col items-center text-center relative z-10">
        {/* Floating Animated Logo Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-purple-950 via-purple-600/40 to-cyan-500/40 border border-purple-400/50 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.5)] backdrop-blur-xl">
            <Crown className="w-12 h-12 md:w-14 md:h-14 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] animate-bounce" />
          </div>
          <div className="absolute -inset-2 rounded-[28px] border border-cyan-400/30 border-dashed animate-spin-slow pointer-events-none" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight uppercase">
          TRADE EMPIRE
        </h1>

        {/* Entering Tagline */}
        <div className="flex items-center gap-2 mt-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-gray-300">
            ENTERING THE TRADE WORLD...
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-60 md:w-72 h-2 bg-white/10 border border-white/15 rounded-full mt-6 overflow-hidden p-[1px] relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage Counter */}
        <span className="text-[10px] font-black text-cyan-400 font-mono mt-2 tracking-widest">
          {progress}%
        </span>
      </div>

      {/* Developer Credit Footer */}
      <div className="flex flex-col items-center gap-1.5 relative z-10 mb-2">
        <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
          CRAFTED & DEVELOPED BY
        </span>
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-2xl">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-xs md:text-sm font-black tracking-widest bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent uppercase">
            ADITYA RAJ
          </span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </div>
    </div>
  );
};
