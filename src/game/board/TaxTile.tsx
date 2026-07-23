import React from 'react';
import { BoardTile } from '../../types/game';
import { Landmark } from 'lucide-react';

interface TaxTileProps {
  tile: BoardTile;
  orientationClass: string;
  children?: React.ReactNode;
}

export const TaxTile: React.FC<TaxTileProps> = ({ tile, orientationClass, children }) => {
  return (
    <div
      className={`relative flex ${orientationClass} bg-white border border-slate-300 overflow-hidden transition-all duration-300 select-none hover:bg-slate-50 group w-full h-full`}
    >
      <div className="flex flex-col p-1 h-full w-full justify-between items-center relative z-10 text-center">
        <span className="text-[8px] md:text-[9px] font-black text-slate-800 tracking-tight leading-tight truncate w-full">
          {tile.name}
        </span>
        
        <Landmark className="w-3.5 h-3.5 text-amber-500 my-0.5" />

        <span className="text-[7px] md:text-[8px] font-black text-rose-600 font-mono">
          Pay ₹{tile.cost || 1000}
        </span>
      </div>

      {children}
    </div>
  );
};
