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
              className={`p-4 rounded-[18px] border transition-all duration-300 relative overflow-hidden min-w-[240px] md:min-w-0 md:w-full shrink-0 ${
                player.isBankrupt
                  ? 'bg-red-950/10 border-red-950/20 opacity-40'
                  : isActive
                  ? 'bg-purple-500/10 border-purple-500/50 active-turn-indicator shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                  : 'bg-white/3 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Colored left strip bar */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: PLAYER_COLOR_MAP[player.color] }}
              ></div>

              <div className="pl-3 flex flex-col gap-2.5">
                {/* Header: Avatar, Name & Turn */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs border border-white/10">
                      {player.avatar}
                    </div>
                    <span className={`font-extrabold text-xs tracking-wide ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>
                      {player.name}
                    </span>
                    {isActive && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-lg bg-purple-500/25 text-purple-300 border border-purple-500/30 uppercase font-black tracking-widest animate-pulse">
                        Turn
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {player.inJail && (
                      <span className="flex items-center gap-0.5 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-lg font-black uppercase tracking-wider">
                        <ShieldAlert className="w-2.5 h-2.5" /> Jail
                      </span>
                    )}
                    {player.isBankrupt && (
                      <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-lg font-black uppercase tracking-wider">
                        Bankrupt
                      </span>
                    )}
                  </div>
                </div>

                {/* Cash & Inventory */}
                {!player.isBankrupt && (
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xs font-mono">
                      <Wallet className="w-3.5 h-3.5 text-cyan-500" />
                      ₹{player.money.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 font-bold" title="Properties owned">
                        <span className="text-gray-200 font-extrabold mr-0.5">{totalProperties}</span> Land
                      </div>
                      <div className="flex items-center gap-1 font-bold" title="Houses/Hotels built">
                        <Home className="w-3 h-3 text-emerald-500" />
                        <span className="text-gray-200 font-extrabold">{totalHouses}</span> Prop
                      </div>
                    </div>
                  </div>
                )}

                {/* Manage properties buttons */}
                {isActive && !player.isBankrupt && onManageAssets && (
                  <button
                    onClick={() => onManageAssets(player)}
                    className="w-full mt-2 py-2 text-[10px] font-black uppercase tracking-wider text-center text-purple-400 hover:text-white rounded-xl bg-purple-500/5 hover:bg-purple-600 transition-all border border-purple-500/20 active:scale-95 duration-100 cursor-pointer shadow-sm"
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
