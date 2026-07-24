import React from 'react';
import { Player } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { X, Home, ShieldCheck, DollarSign, Building } from 'lucide-react';
import { GROUP_COLOR_MAP } from '../utils/gridHelper';

interface AssetManagerProps {
  player: Player;
  onClose: () => void;
  onBuildHouse: (tileIndex: number) => void;
  onSellHouse: (tileIndex: number) => void;
  onMortgage: (tileIndex: number) => void;
  onUnmortgage: (tileIndex: number) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  player,
  onClose,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
}) => {
  // Find all tiles owned by the player (either active or mortgaged)
  const ownedTiles = BOARD_TILES.filter(tile => {
    const activeString = tile.index.toString();
    const mortgagedString = `${tile.index}m`;
    return (player.properties || []).includes(activeString) || (player.properties || []).includes(mortgagedString);
  });

  return (
    <div className="absolute inset-0 bg-[#0d0e12]/90 backdrop-blur-md rounded-2xl flex flex-col p-5 z-30">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Asset Management</h3>
          <p className="text-xs text-gray-400">Manage houses, mortgages for {player.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-gray-200 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Balance Indicator */}
      <div className="mt-3.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-semibold">Available Funds:</span>
        <span className="text-lg font-extrabold text-cyan-400">₹{player.money.toLocaleString()}</span>
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 flex flex-col gap-3.5 no-scrollbar">
        {ownedTiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
            <Building className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
            <p className="text-sm font-semibold">No properties owned yet.</p>
            <p className="text-xs opacity-70 mt-1 max-w-[15rem]">Land on cities, railways, or utilities to purchase them during game play.</p>
          </div>
        ) : (
          ownedTiles.map(tile => {
            const tileIndex = tile.index;
            const isMortgaged = (player.properties || []).includes(`${tileIndex}m`);
            const houseCount = player.houses[tileIndex] || 0;
            const details = tile.details;

            const baseCost = details?.cost || tile.cost || 0;
            const mortgageValue = Math.floor(baseCost / 2);
            const unmortgageCost = Math.floor(baseCost * 0.6);

            return (
              <div
                key={tileIndex}
                className={`p-3 rounded-xl border flex flex-col gap-3 bg-white/3 transition-all ${
                  isMortgaged ? 'border-amber-900/30 opacity-75' : 'border-white/5'
                }`}
              >
                {/* Tile Header: Name + Group Color / Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Color Banner */}
                    {details ? (
                      <div className={`w-3.5 h-3.5 rounded-full ${GROUP_COLOR_MAP[details.group]} border border-black/30`}></div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-500 border border-black/30"></div>
                    )}
                    <span className="font-bold text-sm text-gray-200">{tile.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isMortgaged ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        Mortgaged
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Active
                      </span>
                    )}

                    {!isMortgaged && tile.type === 'property' && (
                      <div className="flex gap-0.5 items-center bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-gray-300">
                        <Home className="w-3 h-3 text-cyan-400" />
                        <span className="font-extrabold">
                          {houseCount === 5 ? 'Hotel' : `${houseCount} H`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Section */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Houses block (Only for standard properties) */}
                  {tile.type === 'property' && !isMortgaged && (
                    <>
                      <button
                        onClick={() => onBuildHouse(tileIndex)}
                        disabled={houseCount >= 5 || player.money < (details?.houseCost || 0)}
                        className="py-1.5 px-2 rounded-lg bg-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all"
                        title="Must own full color group to build"
                      >
                        Build House (+₹{details?.houseCost})
                      </button>
                      <button
                        onClick={() => onSellHouse(tileIndex)}
                        disabled={houseCount === 0}
                        className="py-1.5 px-2 rounded-lg bg-rose-600/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all"
                      >
                        Sell House (Refund ₹{details ? Math.floor(details.houseCost / 2) : 0})
                      </button>
                    </>
                  )}

                  {/* Mortgage block */}
                  {isMortgaged ? (
                    <button
                      onClick={() => onUnmortgage(tileIndex)}
                      disabled={player.money < unmortgageCost}
                      className="col-span-2 py-1.5 px-2 rounded-lg bg-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all"
                    >
                      Unmortgage (Pay ₹{unmortgageCost})
                    </button>
                  ) : (
                    <button
                      onClick={() => onMortgage(tileIndex)}
                      disabled={houseCount > 0}
                      className={`py-1.5 px-2 rounded-lg bg-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all ${
                        tile.type !== 'property' ? 'col-span-2' : ''
                      }`}
                      title="Sell houses first"
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
  );
};
