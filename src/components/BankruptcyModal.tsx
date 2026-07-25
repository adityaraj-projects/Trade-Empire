import React from 'react';
import { Player } from '../types/game';
import { Skull, TrendingDown, RefreshCcw, LogOut, Frown, ShieldAlert, Award, X } from 'lucide-react';

interface BankruptcyModalProps {
  player: Player;
  onSpectate: () => void;
  onQuit: () => void;
}

export const BankruptcyModal: React.FC<BankruptcyModalProps> = ({ player, onSpectate, onQuit }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#0d0e12] border border-rose-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)] relative flex flex-col items-center text-center gap-4 text-gray-200 animate-scale-up overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Right Close X Button */}
        <button
          onClick={onSpectate}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
          title="Close Modal (Spectate Mode)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dramatic Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-bounce mt-2">
          <Skull className="w-8 h-8" />
        </div>

        {/* Title */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
            ELIMINATED / KANGAL
          </span>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-rose-400 via-red-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider mt-2.5">
            TOTAL BANKRUPT! 💸
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto font-semibold leading-relaxed">
            Aapka Vyapaar tabah ho gaya! Saari sampatti neelam ho gayi aur aap sadak par aa gaye ho! ☠️
          </p>
        </div>

        {/* Fun Stats Summary */}
        <div className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-gray-400 font-bold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Financial Status:
            </span>
            <span className="font-extrabold text-rose-400 uppercase tracking-wider">Sadak Chhap Vyapari</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-gray-400 font-bold">Remaining Cash:</span>
            <span className="font-black text-rose-400">₹0 (Kangal)</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">Properties Left:</span>
            <span className="font-black text-gray-400">0 (Nil)</span>
          </div>
        </div>

        {/* Humorous Insult Quote */}
        <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[10px] text-amber-300 font-bold italic leading-relaxed">
          "Bhai business chalaana sabke bas ki baat nahi hoti... Ab aamtaur par baaki vyapariyo ka tamasha dekho!" 😂
        </div>

        {/* Action Triggers */}
        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={onSpectate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-black text-xs uppercase tracking-widest text-white transition-all cursor-pointer shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Spectate Game (Dusro Ka Maza Dekho)
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Quit to Main Menu
          </button>
        </div>

      </div>
    </div>
  );
};
