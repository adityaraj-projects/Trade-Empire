import React from 'react';
import { BoardTile } from '../../types/game';
import { ShieldAlert, ArrowUpRight, Flame, Coffee } from 'lucide-react';

interface CornerTileProps {
  tile: BoardTile;
  orientationClass: string;
  children?: React.ReactNode;
}

export const CornerTile: React.FC<CornerTileProps> = ({ tile, orientationClass, children }) => {
  const getIcon = () => {
    switch (tile.type) {
      case 'start':
        return <ArrowUpRight className="w-5 h-5 text-emerald-500 animate-pulse mt-0.5" />;
      case 'jail':
        return <ShieldAlert className="w-4 h-4 text-amber-500 mb-0.5" />;
      case 'rest':
        return <Coffee className="w-4 h-4 text-sky-400 mb-0.5" />;
      case 'go_to_jail':
        return <Flame className="w-4 h-4 text-rose-500 mb-0.5 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStyle = () => {
    switch (tile.type) {
      case 'start':
        return { text: 'START', sub: 'Collect ₹2,000', color: 'text-emerald-700' };
      case 'jail':
        return { text: 'JAIL', sub: 'VISITING', color: 'text-amber-800' };
      case 'rest':
        return { text: 'REST HOUSE', sub: 'FREE SPOT', color: 'text-sky-700' };
      case 'go_to_jail':
        return { text: 'GO TO JAIL', sub: 'GO DIRECTLY', color: 'text-rose-700' };
      default:
        return { text: '', sub: '', color: '' };
    }
  };

  const display = getStyle();

  return (
    <div
      className={`relative flex ${orientationClass} bg-slate-100 border border-slate-300 overflow-hidden w-full h-full select-none justify-center items-center text-center p-1.5`}
    >
      <div className="flex flex-col items-center justify-center relative z-10">
        <span className={`text-[9px] md:text-[10px] font-black tracking-wide ${display.color}`}>
          {display.text}
        </span>
        <span className="text-[6px] md:text-[7px] text-slate-600 font-extrabold uppercase">{display.sub}</span>
        {getIcon()}
      </div>

      {children}
    </div>
  );
};
