import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Play, UserPlus, Info, BookOpen, Crown, X, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const setPage = useGameStore((state) => state.setPage);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden text-gray-200">
      
      {/* Supercell background floating elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-purple-600/10 rounded-3xl blur-xl float-animation pointer-events-none"></div>
      <div className="absolute bottom-16 right-12 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl float-animation-delayed pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-indigo-500/5 rounded-2xl blur-3xl float-animation pointer-events-none"></div>

      {/* Header bar */}
      <div className="h-16 flex items-center justify-between px-4 max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <span className="font-black text-sm tracking-widest text-yellow-400 font-sans">ROYALE EDITION</span>
        </div>
        <span className="text-[10px] tracking-widest font-black text-gray-400 uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
          v2.0.0-RC1
        </span>
      </div>

      {/* Hero Body */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full z-10 py-8">
        
        {/* Animated Brand Shield */}
        <div className="text-center flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transform rotate-6 mb-6 hover:rotate-12 transition-transform duration-300 border border-white/20 relative">
            <span className="text-4xl font-black text-slate-950 select-none">TE</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent font-sans uppercase drop-shadow-md select-none">
            TRADE EMPIRE
          </h1>
          <p className="text-xs md:text-sm font-black tracking-widest text-cyan-400 mt-3 uppercase bg-cyan-500/5 border border-cyan-500/20 px-4 py-1.5 rounded-full">
            Build. Trade. Rule.
          </p>
        </div>

        {/* Action Panel Buttons (Supercell Glossy Style) */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md px-4 mb-10">
          <button
            onClick={() => setPage('create-room')}
            className="btn-supercell btn-supercell-purple flex-1 py-4.5 px-6 text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all text-white font-extrabold uppercase"
          >
            <Play className="w-4 h-4 fill-white" />
            Create Room
          </button>

          <button
            onClick={() => setPage('join-room')}
            className="btn-supercell btn-supercell-cyan flex-1 py-4.5 px-6 text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all text-white font-extrabold uppercase"
          >
            <UserPlus className="w-4.5 h-4.5" />
            Join Room
          </button>
        </div>

        {/* Feature info logs */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-xs font-extrabold text-purple-400 hover:text-purple-300 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 px-5 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            How To Play
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-5 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Info className="w-4 h-4" />
            About Game
          </button>
        </div>

        {/* Cards Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl px-4 text-xs md:text-sm">
          <div className="glass-card p-5 border border-white/10 flex gap-4 bg-white/4 shadow-lg backdrop-blur-md">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 h-11 w-11 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-200 uppercase tracking-wider text-xs">Clash Strategy Rules</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                Configure starting setups, roll dices, trade land deeds atomically, build houses/hotels, and bankrupt opponents.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 border border-white/10 flex gap-4 bg-white/4 shadow-lg backdrop-blur-md">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 h-11 w-11 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-200 uppercase tracking-wider text-xs">Real-Time Synchronization</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                Host-authoritative conflict queues automatically sync actions cleanly across different browsers and screens.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* How To Play Overlay */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg glass-card border border-white/10 p-6 shadow-2xl relative bg-slate-900/90 max-h-[85vh] flex flex-col justify-between">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-gray-100 uppercase tracking-wide">How To Play</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-xs text-gray-400 leading-relaxed no-scrollbar">
              <div>
                <h4 className="font-black text-purple-400 uppercase tracking-wide mb-1 text-[11px]">1. Starting Room</h4>
                <p>Host configures starting parameters and shares the Room Code. Players input codes to connect to the lobby.</p>
              </div>
              <div>
                <h4 className="font-black text-purple-400 uppercase tracking-wide mb-1 text-[11px]">2. Purchases & Upgrades</h4>
                <p>Roll dice to travel board slots. Land on city tiles, railways, or utilities to buy them or trigger property auctions.</p>
              </div>
              <div>
                <h4 className="font-black text-purple-400 uppercase tracking-wide mb-1 text-[11px]">3. Rents & Fees</h4>
                <p>Landing on other players' properties requires rent. Collect complete color groups to build houses or hotels.</p>
              </div>
              <div>
                <h4 className="font-black text-purple-400 uppercase tracking-wide mb-1 text-[11px]">4. Jails & Draw cards</h4>
                <p>Land on Go to Jail to get locked. Land on Chance or Community Chest slots to resolve mystery cards.</p>
              </div>
              <div>
                <h4 className="font-black text-purple-400 uppercase tracking-wide mb-1 text-[11px]">5. Trade Negotiations</h4>
                <p>Propose trade exchanges (properties/cash) to other players on your turn to restructure color groups dynamically.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Overlay */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-card border border-white/10 p-6 shadow-2xl relative text-center bg-slate-900/90">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] transform rotate-6">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-gray-200 uppercase tracking-wider font-sans">TRADE EMPIRE</h3>
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mt-1.5 bg-cyan-500/10 px-3 py-1 rounded-full w-max mx-auto">
              Royale Board Adaptations
            </span>

            <div className="text-xs text-gray-400 flex flex-col gap-3.5 mt-6 border-t border-white/10 pt-5 text-left leading-relaxed">
              <p>
                Trade Empire is a premium multiplayer adaptation of the classic Indian business board game, designed for portfolio-grade flagship highlights.
              </p>
              <p>
                Built using clean React 19, TypeScript, and Tailwind CSS v4, the project implements a host-authoritative snapshot state machine sync adapter.
              </p>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 border-t border-white/10 mt-4 pt-4">
                <span>Release Build</span>
                <span>RC1 (v2.0)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer spacer */}
      <div className="h-8"></div>

    </div>
  );
};
export default Home;
