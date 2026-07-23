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
      <div className="flex flex-col p-1 h-full w-full justify-between relative z-10">
        <span className="text-[8px] md:text-[9px] font-black text-slate-800 tracking-tight leading-tight truncate">
          {tile.name}
        </span>

        {/* Houses / Hotels visual dots */}
        {houseCount > 0 && !isMortgaged && (
          <div className="absolute top-1 right-1 flex gap-0.5 bg-slate-900/80 px-1 py-0.5 rounded scale-[0.75] origin-top-right">
            {houseCount === 5 ? (
              <div className="w-2 h-2 rounded bg-rose-500" title="Hotel"></div>
            ) : (
              Array.from({ length: houseCount }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ))
            )}
          </div>
        )}

        {/* Price tag */}
        <span className="text-[7px] md:text-[8px] font-bold text-blue-600 font-mono">
          {isMortgaged ? 'MORT' : `₹${details.cost}`}
        </span>
      </div>

      {/* Floating Player Tokens inside this cell */}
      {children}
    </div>
  );
};
