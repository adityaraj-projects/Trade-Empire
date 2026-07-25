import React from 'react';
import { BoardTile, Player } from '../types/game';
import { X, Building, Home, ShieldCheck, DollarSign, Repeat, Lock, Unlock } from 'lucide-react';
import { GROUP_COLOR_MAP } from '../utils/gridHelper';
import { PLAYER_COLOR_MAP } from './PlayerList';
import { useHardwareBack } from '../hooks/useHardwareBack';

interface PropertyDeedModalProps {
  tile: BoardTile;
  players: Player[];
  localPlayerId?: string;
  isLocalTurn?: boolean;
  onClose: () => void;
  onBuildHouse?: (tileIndex: number) => void;
  onSellHouse?: (tileIndex: number) => void;
  onMortgage?: (tileIndex: number) => void;
  onUnmortgage?: (tileIndex: number) => void;
  onOpenTrade?: (player: Player) => void;
}

export const PropertyDeedModal: React.FC<PropertyDeedModalProps> = ({
  tile,
  players,
  localPlayerId,
  isLocalTurn = false,
  onClose,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  onOpenTrade,
}) => {
  useHardwareBack('propertyDeedModal', true, onClose);

  const details = tile.details;
  const cost = details?.cost || tile.cost || 0;

  // Find owner if any
  const owner = players.find(p =>
    (p.properties || []).includes(tile.index.toString()) ||
    (p.properties || []).includes(`${tile.index}m`)
  );

  const isMortgaged = owner ? (owner.properties || []).includes(`${tile.index}m`) : false;
  const houseCount = owner ? (owner.houses || {})[tile.index] || 0 : 0;
  const isOwner = owner?.id === localPlayerId;

  const mortgageValue = Math.floor(cost / 2);
  const redeemValue = Math.floor(mortgageValue * 1.1); // Mortgage + 10% interest

  const groupColorClass = details?.group ? GROUP_COLOR_MAP[details.group] : 'bg-purple-600 text-white';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-[#0d0e12] border border-white/15 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-4 text-gray-200 animate-scale-up max-h-[90vh] overflow-hidden">
        
        {/* Top Right Close X Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer z-20"
          title="Close Card Details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card Header Color Bar */}
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg">
          <div className={`py-3 px-4 text-center font-black uppercase tracking-wider text-sm ${groupColorClass}`}>
            {tile.name}
          </div>
          <div className="bg-black/50 p-2.5 flex items-center justify-between text-xs border-t border-white/10">
            <span className="text-gray-400 font-bold">Purchase Cost:</span>
            <span className="font-mono font-black text-amber-400 text-sm">₹{cost.toLocaleString()}</span>
          </div>
        </div>

        {/* Ownership Status Banner */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {owner ? (
              <>
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black shadow"
                  style={{ backgroundColor: PLAYER_COLOR_MAP[owner.color] }}
                >
                  {owner.avatar || '🎮'}
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Owner</span>
                  <span className="text-xs font-black text-white">{owner.name} {isOwner && '(You)'}</span>
                </div>
              </>
            ) : (
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Unowned Property
              </span>
            )}
          </div>

          {isMortgaged && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Mortgaged
            </span>
          )}
        </div>

        {/* Card Details Schedule */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex flex-col gap-1.5 text-xs overflow-y-auto max-h-[40vh]">
          {details ? (
            <>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-semibold">Base Rent:</span>
                <span className="font-mono font-bold text-white">₹{details.rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-semibold">With 1 House:</span>
                <span className="font-mono font-bold text-emerald-400">₹{details.rent1.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-semibold">With 2 Houses:</span>
                <span className="font-mono font-bold text-emerald-400">₹{details.rent2.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-semibold">With 3 Houses:</span>
                <span className="font-mono font-bold text-emerald-400">₹{details.rent3.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-semibold">With 4 Houses:</span>
                <span className="font-mono font-bold text-emerald-400">₹{details.rent4.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-semibold">With Hotel (5 Houses):</span>
                <span className="font-mono font-bold text-rose-400">₹{details.hotel.toLocaleString()}</span>
              </div>

              {details.houseCost > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400 font-semibold">Build House Cost:</span>
                  <span className="font-mono font-bold text-amber-400">₹{details.houseCost.toLocaleString()}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-400 font-medium">
              Special Board Tile ({tile.type.toUpperCase()})
            </div>
          )}

          {/* Mortgage & Redeem Values */}
          <div className="flex justify-between items-center py-1.5 border-t border-white/10 mt-1">
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Mortgage Cash:
            </span>
            <span className="font-mono font-black text-amber-400">₹{mortgageValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" /> Redeem Value:
            </span>
            <span className="font-mono font-black text-cyan-400">₹{redeemValue.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons for Property Owner */}
        {isOwner && isLocalTurn && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Build / Sell House */}
            {details && details.houseCost > 0 && !isMortgaged && (
              <>
                <button
                  onClick={() => onBuildHouse?.(tile.index)}
                  disabled={houseCount >= 5 || (owner?.money || 0) < details.houseCost}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow"
                >
                  <Home className="w-3.5 h-3.5" /> Build (+₹{details.houseCost})
                </button>
                <button
                  onClick={() => onSellHouse?.(tile.index)}
                  disabled={houseCount === 0}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Sell House
                </button>
              </>
            )}

            {/* Mortgage / Redeem Button */}
            {!isMortgaged ? (
              <button
                onClick={() => onMortgage?.(tile.index)}
                disabled={houseCount > 0}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow col-span-2"
              >
                <Lock className="w-3.5 h-3.5" /> Mortgage (+₹{mortgageValue.toLocaleString()})
              </button>
            ) : (
              <button
                onClick={() => onUnmortgage?.(tile.index)}
                disabled={(owner?.money || 0) < redeemValue}
                className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow col-span-2"
              >
                <Unlock className="w-3.5 h-3.5" /> Redeem (-₹{redeemValue.toLocaleString()})
              </button>
            )}
          </div>
        )}

        {/* Trade Button for Non-Owner */}
        {owner && !isOwner && onOpenTrade && (
          <button
            onClick={() => {
              onClose();
              onOpenTrade(owner);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow"
          >
            <Repeat className="w-3.5 h-3.5" /> Trade with {owner.name}
          </button>
        )}
      </div>
    </div>
  );
};
