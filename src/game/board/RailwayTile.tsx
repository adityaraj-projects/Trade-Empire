import React from 'react';
import { BoardTile } from '../../types/game';
import { Train } from 'lucide-react';

interface RailwayTileProps {
  tile: BoardTile;
  isMortgaged: boolean;
  ownerColor?: string;
  orientationClass: string;
  children?: React.ReactNode;
}

export const RailwayTile: React.FC<RailwayTileProps> = ({
  tile,
  isMortgaged,
  ownerColor,
  orientationClass,
  children,
}) => {
  return (
    <div
      style={ownerColor ? { borderColor: ownerColor + 'cc', borderWidth: '2px' } : {}}
      className={`relative flex ${orientationClass} bg-white border border-slate-300 overflow-hidden transition-all duration-300 select-none hover:bg-slate-50 group w-full h-full`}
    >
      <div className="flex flex-col p-[2px] md:p-1 h-full w-full justify-between items-center relative z-10 text-center">
        <span className="text-[6px] md:text-[9px] lg:text-[10px] font-black text-slate-800 tracking-tight leading-tight truncate w-full">
          {tile.name}
        </span>
        
        <Train className="w-[10px] md:w-3.5 h-[10px] md:h-3.5 text-slate-700 group-hover:scale-110 transition-transform my-[1px] md:my-0.5" />

        <span className="text-[6px] md:text-[8px] lg:text-[9px] font-bold text-blue-600 font-mono">
          {isMortgaged ? 'MORT' : `₹${tile.cost || tile.details?.cost || 2000}`}
        </span>
      </div>

      {ownerColor && (
        <div
          className="absolute bottom-0.5 md:bottom-1 right-0.5 md:right-1 w-[6px] md:w-2.5 h-[6px] md:h-2.5 rounded-full border border-white/80 z-20 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          style={{ backgroundColor: ownerColor, boxShadow: `0 0 6px ${ownerColor}` }}
          title="Owner Indicator"
        />
      )}

      {children}
    </div>
  );
};
