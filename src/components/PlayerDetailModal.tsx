import React from 'react';
import { Player } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { X, Building2, Home, ShieldCheck, Wallet, Award } from 'lucide-react';
import { GROUP_COLOR_MAP } from '../utils/gridHelper';

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  onOpenAssetManager?: (player: Player) => void;
  isSelfOrHostBot?: boolean;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  onClose,
  onOpenAssetManager,
  isSelfOrHostBot = false,
}) => {
  // Find all tiles owned by this player
  const ownedTiles = BOARD_TILES.filter(tile => {
    const activeString = tile.index.toString();
    const mortgagedString = `${tile.index}m`;
    return (player.properties || []).includes(activeString) || (player.properties || []).includes(mortgagedString);
  });

  // Calculate Net Worth
  let propertiesValue = 0;
  let housesValue = 0;

  ownedTiles.forEach(t => {
    const cost = t.details?.cost || t.cost || 0;
    propertiesValue += cost;
    const houseCount = (player.houses || {})[t.index] || 0;
    const houseCost = t.details?.houseCost || 0;
    housesValue += houseCount * houseCost;
  });

  const netWorth = player.money + propertiesValue + housesValue;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 text-gray-200 animate-scale-up max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
              {player.avatar || '🎮'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wide text-white">{player.name}</h3>
                {player.isBankrupt && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Bankrupt
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                {player.inJail ? 'In Jail' : 'Active Player'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col gap-1">
            <span className="text-[9px] uppercase font-extrabold text-emerald-400 tracking-wider flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Available Cash
            </span>
            <span className="text-base font-black text-white">₹{player.money.toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex flex-col gap-1">
            <span className="text-[9px] uppercase font-extrabold text-purple-400 tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" /> Estimated Net Worth
            </span>
            <span className="text-base font-black text-white">₹{netWorth.toLocaleString()}</span>
          </div>
        </div>

        {/* Properties Section Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Owned Empire ({ownedTiles.length})
          </span>
        </div>

        {/* Properties Scroll Area */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[35vh] no-scrollbar">
          {ownedTiles.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 font-semibold bg-white/2 rounded-2xl border border-white/5">
              No properties purchased yet.
            </div>
          ) : (
            ownedTiles.map(t => {
              const isMortgaged = (player.properties || []).includes(`${t.index}m`);
              const houseCount = (player.houses || {})[t.index] || 0;
              const details = t.details;
              const baseCost = details?.cost || t.cost || 0;

              return (
                <div
                  key={t.index}
                  className="p-2.5 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    {details ? (
                      <div className={`w-3.5 h-3.5 rounded-full ${GROUP_COLOR_MAP[details.group]} border border-black/40`} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-500 border border-black/40" />
                    )}
                    <div>
                      <span className="text-xs font-black text-gray-200 block">{t.name}</span>
                      <span className="text-[9px] font-bold text-gray-500">Value: ₹{baseCost.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isMortgaged ? (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        Mortgaged
                      </span>
                    ) : (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Active
                      </span>
                    )}

                    {!isMortgaged && t.type === 'property' && houseCount > 0 && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase flex items-center gap-0.5">
                        <Home className="w-2.5 h-2.5" /> {houseCount === 5 ? 'Hotel' : `${houseCount} H`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex gap-2">
          {isSelfOrHostBot && onOpenAssetManager && (
            <button
              onClick={() => {
                onClose();
                onOpenAssetManager(player);
              }}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-black text-xs uppercase tracking-wider text-white transition-all cursor-pointer text-center"
            >
              Manage Assets
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-black text-xs uppercase tracking-wider text-gray-300 transition-all cursor-pointer text-center"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
