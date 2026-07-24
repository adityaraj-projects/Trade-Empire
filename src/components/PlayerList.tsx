import React from 'react';
import { Player, PlayerColor } from '../types/game';
import { ShieldAlert, User, Wallet, Home } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  activePlayerIndex: number;
  onManageAssets?: (player: Player) => void;
}

export const PLAYER_COLOR_MAP: { [key in PlayerColor]: string } = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
  emerald: '#10b981',
  amber: '#f59e0b',
};

export const PlayerList: React.FC<PlayerListProps> = ({ players, activePlayerIndex, onManageAssets }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h2 className="text-[10px] font-black tracking-wider text-gray-500 uppercase">Scoreboard Stats</h2>
      
      {/* Responsive Stacking: Horizontal scrollable rows on mobile, vertical column on desktop */}
      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-4 pb-2 md:pb-0 no-scrollbar">
        {players.map((player, idx) => {
          const isActive = idx === activePlayerIndex;
          const totalProperties = (player.properties || []).length;
          const totalHouses = Object.values(player.houses || {}).reduce((a, b) => a + b, 0);

          return (
            <div
              key={player.id}
              className={`rounded-xl md:rounded-[18px] border transition-all duration-300 relative overflow-hidden shrink-0 
                p-1.5 min-w-[125px] md:p-4 md:min-w-0 md:w-full ${
                player.isBankrupt
                  ? 'bg-red-950/10 border-red-950/20 opacity-40'
                  : isActive
                  ? 'bg-purple-500/10 border-purple-500/50 active-turn-indicator shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-white/3 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Colored left strip bar */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1 md:w-1.5"
                style={{ backgroundColor: PLAYER_COLOR_MAP[player.color] }}
              ></div>

              <div className="pl-1.5 md:pl-3 flex flex-col justify-between h-full gap-1 md:gap-2.5">
                {/* Header: Avatar, Name & Turn */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg bg-slate-800 flex items-center justify-center text-[10px] md:text-xs border border-white/10 shrink-0">
                      {player.avatar}
                    </div>
                    <span className={`font-extrabold text-[10px] md:text-xs tracking-wide truncate max-w-[55px] md:max-w-none ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>
                      {player.name}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shrink-0 md:hidden" />
                    )}
                    {isActive && (
                      <span className="hidden md:inline-block text-[8px] px-1.5 py-0.5 rounded-lg bg-purple-500/25 text-purple-300 border border-purple-500/30 uppercase font-black tracking-widest animate-pulse">
                        Turn
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 scale-75 md:scale-100 origin-right">
                    {player.inJail && (
                      <span className="flex items-center gap-0.5 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                        Jail
                      </span>
                    )}
                    {player.isBankrupt && (
                      <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                        Bankrupt
                      </span>
                    )}
                  </div>
                </div>

                {/* Cash & Inventory */}
                {!player.isBankrupt && (
                  <div className="flex items-center justify-between text-[9px] md:text-[11px] text-gray-400">
                    <div className="flex items-center gap-0.5 md:gap-1.5 text-cyan-400 font-black text-[10px] md:text-xs font-mono">
                      <Wallet className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-500 shrink-0" />
                      ₹{player.money.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-3 shrink-0 font-bold">
                      <div className="flex items-center gap-0.5" title="Properties & Houses owned">
                        <Home className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500 shrink-0" />
                        <span className="text-gray-200 font-extrabold">{totalProperties + totalHouses}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manage properties buttons */}
                {isActive && !player.isBankrupt && onManageAssets && (
                  <button
                    onClick={() => onManageAssets(player)}
                    className="hidden md:block w-full mt-2 py-2 text-[10px] font-black uppercase tracking-wider text-center text-purple-400 hover:text-white rounded-xl bg-purple-500/5 hover:bg-purple-600 transition-all border border-purple-500/20 active:scale-95 duration-100 cursor-pointer shadow-sm"
                  >
                    Manage Assets
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PlayerList;
