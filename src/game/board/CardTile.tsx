import React from 'react';
import { BoardTile } from '../../types/game';
import { Sparkles, HelpCircle } from 'lucide-react';

interface CardTileProps {
  tile: BoardTile;
  orientationClass: string;
  children?: React.ReactNode;
}

export const CardTile: React.FC<CardTileProps> = ({ tile, orientationClass, children }) => {
  const isCommunity = tile.name.toLowerCase().includes('chest') || tile.name.toLowerCase().includes('vyapaar');

  return (
    <div
      className={`relative flex ${orientationClass} bg-white border border-slate-300 overflow-hidden transition-all duration-300 select-none hover:bg-slate-50 group w-full h-full`}
    >
      <div className="flex flex-col p-1 h-full w-full justify-between items-center relative z-10 text-center">
        <span className="text-[8px] md:text-[9px] font-black text-slate-800 tracking-tight leading-tight w-full">
          {tile.name}
        </span>
        
        {isCommunity ? (
          <HelpCircle className="w-4 h-4 text-cyan-500 my-0.5 animate-pulse" />
        ) : (
          <Sparkles className="w-4 h-4 text-purple-500 my-0.5" />
        )}

        <span className="text-[6px] text-slate-500 uppercase tracking-widest font-black">
          Draw Card
        </span>
      </div>

      {children}
    </div>
  );
};
