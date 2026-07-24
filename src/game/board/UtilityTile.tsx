import React from 'react';
import { BoardTile } from '../../types/game';
import { Zap, Droplets, HelpCircle } from 'lucide-react';

interface UtilityTileProps {
  tile: BoardTile;
  isMortgaged: boolean;
  ownerColor?: string;
  orientationClass: string;
  children?: React.ReactNode;
}

export const UtilityTile: React.FC<UtilityTileProps> = ({
  tile,
  isMortgaged,
  ownerColor,
  orientationClass,
  children,
}) => {
  const getIcon = () => {
    const name = tile.name.toLowerCase();
    if (name.includes('electric')) {
      return <Zap className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform my-0.5" />;
    } else if (name.includes('water')) {
      return <Droplets className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform my-0.5" />;
    }
    return <HelpCircle className="w-3.5 h-3.5 text-gray-400 my-0.5" />;
  };

  return (
    <div
      style={ownerColor ? { borderColor: ownerColor + 'cc', borderWidth: '2px' } : {}}
      className={`relative flex ${orientationClass} bg-white border border-slate-300 overflow-hidden transition-all duration-300 select-none hover:bg-slate-50 group w-full h-full`}
    >
      <div className="flex flex-col p-1 h-full w-full justify-between items-center relative z-10 text-center">
        <span className="text-[8px] md:text-[9px] font-black text-slate-800 tracking-tight leading-tight truncate w-full">
          {tile.name}
        </span>
        
        {getIcon()}

        <span className="text-[7px] md:text-[8px] font-bold text-blue-600 font-mono">
          {isMortgaged ? 'MORT' : `₹${tile.cost || tile.details?.cost || 1500}`}
        </span>
      </div>

      {ownerColor && (
        <div
          className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white/80 z-20 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          style={{ backgroundColor: ownerColor, boxShadow: `0 0 6px ${ownerColor}` }}
          title="Owner Indicator"
        />
      )}

      {children}
    </div>
  );
};
