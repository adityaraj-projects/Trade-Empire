import React from 'react';
import { AuctionState, Player } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { Gavel, Clock, User } from 'lucide-react';

interface AuctionPanelProps {
  auction: AuctionState;
  players: Player[];
  localPlayerId: string;
  onBid: (amount: number) => void;
  onPass: () => void;
}

export const AuctionPanel: React.FC<AuctionPanelProps> = ({
  auction,
  players,
  localPlayerId,
  onBid,
  onPass,
}) => {
  const tile = BOARD_TILES[auction.tileIndex];
  
  const currentBidderId = auction.activeBidderIds[auction.currentBidderIndex];
  const currentBidder = players.find(p => p.id === currentBidderId);
  const isLocalBidderTurn = currentBidderId === localPlayerId;

  const highestBidder = players.find(p => p.id === auction.highestBidderId);
  const cost = tile.details?.cost || tile.cost || 0;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-white/10 shadow-2xl relative custom-glow flex flex-col gap-5 text-gray-200">
        
        {/* Title Banner */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-gray-200">Property Auction</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Bidding in progress</p>
          </div>
        </div>

        {/* Property details card */}
        <div className="bg-black/35 border border-white/5 rounded-xl p-4 flex justify-between items-center shadow-inner">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Landed Property</span>
            <h3 className="text-sm font-black text-gray-100">{tile.name}</h3>
            <span className="text-[10px] text-gray-400 font-semibold">Base value: ₹{cost.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-yellow-400/80 tracking-wider block mb-0.5">Highest Bid</span>
            <span className="text-xl font-black text-yellow-400 font-mono">₹{auction.highestBid.toLocaleString()}</span>
            {highestBidder && (
              <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Held by: {highestBidder.name}
              </span>
            )}
          </div>
        </div>

        {/* Current Bidder turn status */}
        <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-3">
          <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs font-semibold text-gray-300">
            {isLocalBidderTurn ? (
              <span className="text-purple-300 font-bold">Your turn to Bid!</span>
            ) : (
              <span>Waiting for <span className="text-cyan-400 font-bold">{currentBidder?.name}</span> to place a bid or pass...</span>
            )}
          </span>
        </div>

        {/* Actions panel */}
        {isLocalBidderTurn ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onBid(auction.highestBid + 100)}
                className="py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:border-purple-500/50 text-purple-300 hover:bg-purple-600/20 font-bold transition-all text-xs cursor-pointer shadow-sm"
              >
                +₹100
              </button>
              <button
                onClick={() => onBid(auction.highestBid + 500)}
                className="py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:border-purple-500/50 text-purple-300 hover:bg-purple-600/20 font-bold transition-all text-xs cursor-pointer shadow-sm"
              >
                +₹500
              </button>
              <button
                onClick={() => onBid(auction.highestBid + 1000)}
                className="py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:border-purple-500/50 text-purple-300 hover:bg-purple-600/20 font-bold transition-all text-xs cursor-pointer shadow-sm"
              >
                +₹1,000
              </button>
            </div>
            
            <div className="flex gap-3 mt-1.5">
              <button
                onClick={onPass}
                className="flex-1 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/20 text-rose-400 font-black tracking-widest text-xs transition-all uppercase cursor-pointer"
              >
                Pass / Decline
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 text-xs font-semibold uppercase animate-pulse">
            Bidders are bidding...
          </div>
        )}

        {/* Participating Bidders List */}
        <div className="border-t border-white/5 pt-3">
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Active Bidders</span>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {auction.activeBidderIds.map((id) => {
              const p = players.find(pl => pl.id === id);
              const isActiveTurn = id === currentBidderId;
              return (
                <div
                  key={id}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${
                    isActiveTurn
                      ? 'bg-purple-600/10 border-purple-500/30 text-purple-400'
                      : 'bg-black/20 border-white/5 text-gray-400'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>{p?.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
