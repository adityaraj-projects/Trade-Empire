import React, { useEffect } from 'react';
import { Player } from '../types/game';
import { Award, Trophy, Crown, Sparkles, TrendingUp, Home, LogOut, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
  winner: Player;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onPlayAgain, onQuit }) => {
  // Fire confetti celebration on mount
  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const totalHouses = Object.values(winner.houses || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#0d0e12] border border-yellow-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(234,179,8,0.3)] relative flex flex-col items-center text-center gap-4 text-gray-200 animate-scale-up overflow-hidden">
        
        {/* Top Right Close X Button */}
        <button
          onClick={onQuit}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
          title="Close Victory Screen"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Top Decorative Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Crown Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-950/80 via-yellow-600/30 to-amber-500/30 border border-yellow-400/40 text-yellow-400 flex items-center justify-center shadow-[0_0_35px_rgba(234,179,8,0.4)] animate-bounce mt-2">
          <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
        </div>

        {/* Title */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 justify-center w-max mx-auto">
            <Crown className="w-3.5 h-3.5" /> BHARAT KA MAHA VYAPARI
          </span>
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider mt-3">
            VICTORY ROYALE! 🏆
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto font-bold leading-relaxed">
            <span className="text-yellow-400 font-black">{winner.name}</span> ne baaki sabhi vyapariyo ko bankrupt karke Trade Empire par raaj kar liya hai! 🔥
          </p>
        </div>

        {/* Winner Stats Breakdown Card */}
        <div className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-gray-400 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-400" /> Title Rating:
            </span>
            <span className="font-black text-yellow-400 uppercase tracking-wider">MAHA VYAPARI EMPEROR</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-gray-400 font-bold">Final Treasury Cash:</span>
            <span className="font-extrabold text-emerald-400">₹{winner.money.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-gray-400 font-bold">Properties Owned:</span>
            <span className="font-extrabold text-cyan-400">{(winner.properties || []).length} Titles</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">Houses & Hotels:</span>
            <span className="font-extrabold text-purple-400">{totalHouses} Built</span>
          </div>
        </div>

        {/* Celebratory Quote */}
        <div className="p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl text-[10px] text-yellow-300 font-bold italic leading-relaxed">
          "Badhaai ho {winner.name}! Aapne poore board par apna ek-chhatra raaj qayam kar liya hai! 🎉"
        </div>

        {/* Action Triggers */}
        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={() => {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:to-amber-400 font-black text-xs uppercase tracking-widest text-slate-950 transition-all cursor-pointer shadow-lg shadow-yellow-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Celebrate Again (Fireworks 🎆)
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Back to Main Menu
          </button>
        </div>

      </div>
    </div>
  );
};
