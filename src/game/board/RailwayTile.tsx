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
      <div className="flex flex-col p-1 h-full w-full justify-between items-center relative z-10 text-center">
        <span className="text-[8px] md:text-[9px] font-black text-slate-800 tracking-tight leading-tight truncate w-full">
          {tile.name}
        </span>
        
        <Train className="w-3.5 h-3.5 text-slate-700 group-hover:scale-110 transition-transform my-0.5" />

        <span className="text-[7px] md:text-[8px] font-bold text-blue-600 font-mono">
          {isMortgaged ? 'MORT' : `₹${tile.cost || tile.details?.cost || 2000}`}
        </span>
      </div>

      {children}
    </div>
  );
};
