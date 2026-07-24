import React from 'react';
import { BoardTile } from '../../types/game';
import { GROUP_COLOR_MAP } from '../../utils/gridHelper';

interface PropertyTileProps {
  tile: BoardTile;
  isMortgaged: boolean;
  houseCount: number;
  ownerColor?: string;
  orientationClass: string;
  colorBarClass: string;
  children?: React.ReactNode;
}

export const PropertyTile: React.FC<PropertyTileProps> = ({
  tile,
  isMortgaged,
  houseCount,
  ownerColor,
  orientationClass,
  colorBarClass,
  children,
}) => {
  const details = tile.details;
  if (!details) return null;

  return (
    <div
      style={ownerColor ? { borderColor: ownerColor + 'cc', borderWidth: '2px' } : {}}
      className={`relative flex ${orientationClass} bg-white border border-slate-300 overflow-hidden transition-all duration-300 select-none hover:bg-slate-50 group w-full h-full`}
    >
      {/* Property Group Color Bar */}
      <div className={`${colorBarClass} ${GROUP_COLOR_MAP[details.group]}`} />

      {/* Main content grid details */}
      <div className="flex flex-col p-[2px] md:p-1 h-full w-full justify-between relative z-10">
        <span className="text-[6px] md:text-[9px] lg:text-[10px] font-black text-slate-800 tracking-tight leading-tight truncate">
          {tile.name}
        </span>

        {/* Houses / Hotels visual dots */}
        {houseCount > 0 && !isMortgaged && (
          <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 flex gap-[1px] md:gap-0.5 bg-slate-900/80 px-0.5 md:px-1 py-0.5 rounded scale-[0.6] md:scale-[0.75] origin-top-right">
            {houseCount === 5 ? (
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded bg-rose-500" title="Hotel"></div>
            ) : (
              Array.from({ length: houseCount }).map((_, i) => (
                <div key={i} className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400" />
              ))
            )}
          </div>
        )}

        {/* Price tag */}
        <span className="text-[6px] md:text-[8px] lg:text-[9px] font-bold text-blue-600 font-mono">
          {isMortgaged ? 'MORT' : `₹${details.cost}`}
        </span>
      </div>

      {ownerColor && (
        <div
          className="absolute bottom-0.5 md:bottom-1 right-0.5 md:right-1 w-[6px] md:w-2.5 h-[6px] md:h-2.5 rounded-full border border-white/80 z-20 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          style={{ backgroundColor: ownerColor, boxShadow: `0 0 6px ${ownerColor}` }}
          title="Owner Indicator"
        />
      )}

      {/* Floating Player Tokens inside this cell */}
      {children}
    </div>
  );
};
