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
    <div className="flex flex-col gap-1 md:gap-3 w-full">
      <h2 className="text-[8px] md:text-[10px] font-black tracking-wider text-gray-500 uppercase">Scoreboard</h2>
      
      {/* Responsive Stacking: Horizontal scrollable rows on mobile, vertical column on desktop */}
      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 md:gap-4 pb-1 md:pb-0 no-scrollbar">
        {players.map((player, idx) => {
          const isActive = idx === activePlayerIndex;
          const totalProperties = (player.properties || []).length;
          const totalHouses = Object.values(player.houses || {}).reduce((a, b) => a + b, 0);

          return (
            <div
              key={player.id}
              className={`rounded-lg md:rounded-xl border transition-all duration-300 relative overflow-hidden shrink-0 
                w-[100px] h-[48px] p-1.5
                md:w-full md:h-[72px] md:p-3 ${
                player.isBankrupt
                  ? 'bg-red-950/10 border-red-950/20 opacity-40'
                  : isActive
                  ? 'bg-purple-500/10 border-purple-500/50 active-turn-indicator shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
                  : 'bg-white/3 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Colored left strip bar */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ backgroundColor: PLAYER_COLOR_MAP[player.color] }}
              ></div>

              <div className="pl-1.5 flex flex-col justify-between h-full">
                {/* Header: Avatar, Name & Turn */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-[14px] h-[14px] md:w-5 md:h-5 rounded md:rounded bg-slate-800 flex items-center justify-center text-[8px] md:text-xs border border-white/10 shrink-0">
                      {player.avatar}
                    </div>
                    <span className={`font-extrabold text-[8px] md:text-xs tracking-wide truncate ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {player.inJail && (
                      <span className="text-[5px] md:text-[7px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-0.5 md:px-1 py-[1px] md:py-0.5 rounded font-black uppercase tracking-wider animate-pulse">
                        Jail
                      </span>
                    )}
                    {player.isBankrupt && (
                      <span className="text-[5px] md:text-[7px] bg-red-500/20 text-red-400 border border-red-500/30 px-0.5 md:px-1 py-[1px] md:py-0.5 rounded font-black uppercase tracking-wider">
                        Bankrupt
                      </span>
                    )}
                    {isActive && !player.isBankrupt && (
                      <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Cash & Inventory */}
                {!player.isBankrupt && (
                  <div className="flex items-center justify-between text-[7px] md:text-[10px] text-gray-400">
                    <div className="flex items-center gap-1 text-cyan-400 font-black font-mono">
                      <Wallet className="w-[10px] h-[10px] md:w-3 md:h-3 text-cyan-500 shrink-0" />
                      <span className="text-[7px] md:text-[10px]">₹{player.money.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5 shrink-0 font-bold">
                      {isActive && onManageAssets && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManageAssets(player);
                          }}
                          className="px-1 md:px-1.5 py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-wider text-purple-400 hover:text-white rounded bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 transition-all active:scale-90 cursor-pointer"
                        >
                          Assets
                        </button>
                      )}
                      <div className="flex items-center gap-0.5" title="Properties & Houses owned">
                        <Home className="w-[8px] h-[8px] md:w-2.5 md:h-2.5 text-emerald-500 shrink-0" />
                        <span className="text-gray-200 font-extrabold text-[7px] md:text-[10px]">{totalProperties + totalHouses}</span>
                      </div>
                    </div>
                  </div>
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
