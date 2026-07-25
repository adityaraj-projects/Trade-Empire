import React from 'react';
import { Player } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { X, Home, ShieldCheck, DollarSign, Building } from 'lucide-react';
import { GROUP_COLOR_MAP } from '../utils/gridHelper';
import { useHardwareBack } from '../hooks/useHardwareBack';

interface AssetManagerProps {
  player: Player;
  isLocalTurn?: boolean;
  onClose: () => void;
  onBuildHouse: (tileIndex: number) => void;
  onSellHouse: (tileIndex: number) => void;
  onMortgage: (tileIndex: number) => void;
  onUnmortgage: (tileIndex: number) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  player,
  isLocalTurn = true,
  onClose,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
}) => {
  useHardwareBack('assetManagerModal', true, onClose);

  // Find all tiles owned by the player (either active or mortgaged)
  const ownedTiles = BOARD_TILES.filter(tile => {
    const activeString = tile.index.toString();
    const mortgagedString = `${tile.index}m`;
    return (player.properties || []).includes(activeString) || (player.properties || []).includes(mortgagedString);
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 text-gray-200 animate-scale-up max-h-[90vh] overflow-hidden">
        
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
          title="Close Asset Manager"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-wider text-gray-100">Asset Management</h3>
              {isLocalTurn ? (
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Turn Active
                </span>
              ) : (
                <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Turn Required
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">Manage houses & mortgages for {player.name}</p>
          </div>
        </div>

        {/* Balance Indicator */}
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
          <span className="text-xs text-gray-300 font-semibold">Available Funds:</span>
          <span className="text-base font-black font-mono text-cyan-300">₹{player.money.toLocaleString()}</span>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 no-scrollbar">
          {ownedTiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <Building className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-gray-400" />
              <p className="text-sm font-bold text-gray-300">No properties owned yet.</p>
              <p className="text-xs opacity-70 mt-1 max-w-[15rem]">Land on cities, railways, or utilities to purchase them during game play.</p>
            </div>
          ) : (
            ownedTiles.map(tile => {
              const tileIndex = tile.index;
              const isMortgaged = (player.properties || []).includes(`${tileIndex}m`);
              const houseCount = (player.houses || {})[tileIndex] || 0;
              const details = tile.details;
              const group = details?.group;
              const color = group ? GROUP_COLOR_MAP[group] : '#94a3b8';
              const cost = details?.cost || tile.cost || 0;
              const mortgageValue = Math.floor(cost / 2);
              const unmortgageCost = Math.floor(mortgageValue * 1.1);

              return (
                <div
                  key={tile.index}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    isMortgaged
                      ? 'bg-amber-950/10 border-amber-500/20 opacity-80'
                      : 'bg-white/3 border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Property Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                      <span className="font-extrabold text-sm text-gray-200">{tile.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isMortgaged ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Mortgaged
                        </span>
                      ) : houseCount > 0 ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {houseCount === 5 ? 'Hotel' : `${houseCount} Houses`}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1 border-t border-white/5">
                    {tile.type === 'property' && !isMortgaged && (
                      <>
                        {/* Build House */}
                        <button
                          onClick={() => onBuildHouse(tileIndex)}
                          disabled={!isLocalTurn || houseCount >= 5 || player.money < (details?.houseCost || 0)}
                          className="py-2 px-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all flex items-center justify-center gap-1"
                          title={!isLocalTurn ? "Can only build during your turn" : undefined}
                        >
                          <Home className="w-3.5 h-3.5" />
                          {houseCount === 4 ? 'Build Hotel' : 'Build House'} (₹{details?.houseCost || 0})
                        </button>

                        {/* Sell House */}
                        <button
                          onClick={() => onSellHouse(tileIndex)}
                          disabled={!isLocalTurn || houseCount === 0}
                          className="py-2 px-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all text-center"
                          title={!isLocalTurn ? "Can only sell during your turn" : undefined}
                        >
                          Sell House (+₹{details ? Math.floor(details.houseCost / 2) : 0})
                        </button>
                      </>
                    )}

                    {/* Mortgage block */}
                    {isMortgaged ? (
                      <button
                        onClick={() => onUnmortgage(tileIndex)}
                        disabled={!isLocalTurn || player.money < unmortgageCost}
                        className="col-span-2 py-2 px-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-300 font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all"
                        title={!isLocalTurn ? "Can only unmortgage during your turn" : undefined}
                      >
                        Unmortgage (Pay ₹{unmortgageCost})
                      </button>
                    ) : (
                      <button
                        onClick={() => onMortgage(tileIndex)}
                        disabled={!isLocalTurn || houseCount > 0}
                        className={`py-2 px-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all ${
                          tile.type !== 'property' ? 'col-span-2' : ''
                        }`}
                        title={!isLocalTurn ? "Can only mortgage during your turn" : "Sell houses first"}
                      >
                        Mortgage (+₹{mortgageValue})
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
