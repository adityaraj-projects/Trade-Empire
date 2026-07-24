import React, { useState } from 'react';
import { Player, TradeProposal } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { RefreshCw, ArrowRightLeft, Check, X, ShieldAlert } from 'lucide-react';

interface TradeModalProps {
  players: Player[];
  localPlayerId: string;
  pendingTrade: TradeProposal | null;
  onProposeTrade: (proposal: TradeProposal) => void;
  onAcceptTrade: () => void;
  onDeclineTrade: () => void;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  players,
  localPlayerId,
  pendingTrade,
  onProposeTrade,
  onAcceptTrade,
  onDeclineTrade,
  onClose,
}) => {
  const localPlayer = players.find(p => p.id === localPlayerId)!;
  const isReceiver = pendingTrade?.receiverId === localPlayerId;
  const isSender = pendingTrade?.senderId === localPlayerId;

  // Proposer creation states
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [requestedCash, setRequestedCash] = useState<number>(0);
  const [offeredProperties, setOfferedProperties] = useState<number[]>([]);
  const [requestedProperties, setRequestedProperties] = useState<number[]>([]);

  const selectedTargetPlayer = players.find(p => p.id === selectedPlayerId);

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;

    onProposeTrade({
      senderId: localPlayerId,
      receiverId: selectedPlayerId,
      offeredCash,
      offeredProperties,
      requestedCash,
      requestedProperties,
    });
  };

  const toggleProperty = (tileIndex: number, isOffer: boolean) => {
    if (isOffer) {
      setOfferedProperties(prev =>
        prev.includes(tileIndex) ? prev.filter(t => t !== tileIndex) : [...prev, tileIndex]
      );
    } else {
      setRequestedProperties(prev =>
        prev.includes(tileIndex) ? prev.filter(t => t !== tileIndex) : [...prev, tileIndex]
      );
    }
  };

  // IF RECEIVED PENDING PROPOSAL (Receiver View)
  if (pendingTrade) {
    const sender = players.find(p => p.id === pendingTrade.senderId)!;
    const receiver = players.find(p => p.id === pendingTrade.receiverId)!;

    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-white/10 shadow-2xl relative custom-glow flex flex-col gap-4 text-gray-200">
          
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-gray-200">Trade Negotiation</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Proposed by {sender.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 leading-relaxed text-xs">
            {/* Sender Offers */}
            <div className="bg-white/2 border border-white/5 rounded-xl p-3.5 shadow-sm">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                {sender.name} Offers to you
              </span>
              <p className="font-bold text-gray-300">₹{pendingTrade.offeredCash.toLocaleString()}</p>
              {pendingTrade.offeredProperties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pendingTrade.offeredProperties.map(idx => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/10 text-[9px] font-black uppercase">
                      {BOARD_TILES[idx].name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sender Requests */}
            <div className="bg-white/2 border border-white/5 rounded-xl p-3.5 shadow-sm">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                {sender.name} Requests from you
              </span>
              <p className="font-bold text-gray-300">₹{pendingTrade.requestedCash.toLocaleString()}</p>
              {pendingTrade.requestedProperties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pendingTrade.requestedProperties.map(idx => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/10 text-[9px] font-black uppercase">
                      {BOARD_TILES[idx].name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Triggers */}
          {isReceiver ? (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={onAcceptTrade}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 font-black tracking-widest text-xs transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 text-white"
              >
                <Check className="w-4 h-4" /> Accept Trade
              </button>
              <button
                onClick={onDeclineTrade}
                className="py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/20 text-rose-400 font-black tracking-widest text-xs transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> Reject Trade
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/15 text-[10px] text-yellow-400 font-bold rounded-xl text-center leading-relaxed mt-2 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>Waiting for receiver to review proposal...</span>
            </div>
          )}

          {isSender && (
            <button
              onClick={onDeclineTrade}
              className="mt-1 w-full py-2.5 rounded-xl bg-white/3 border border-white/5 text-[10px] uppercase font-black text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel Proposal
            </button>
          )}

        </div>
      </div>
    );
  }

  // CREATE NEW TRADE PROPOSAL (Sender View)
  const otherPlayers = players.filter(p => p.id !== localPlayerId && !p.isBankrupt);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-white/10 shadow-2xl relative custom-glow flex flex-col gap-4 text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-gray-200">Propose Trade</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Asset swapping center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer animate-pulse"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePropose} className="flex flex-col gap-4">
          {/* 1. Target player picker */}
          <div>
            <label className="text-[9px] uppercase block text-gray-500 mb-1.5 font-bold tracking-wider">Select Player to Trade with</label>
            <select
              value={selectedPlayerId}
              required
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500 capitalize font-bold"
            >
              <option value="">-- Choose Bidding Partner --</option>
              {otherPlayers.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-950 text-gray-200">
                  {p.name} (₹{p.money.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedPlayerId && (
            <div className="grid grid-cols-2 gap-4">
              
              {/* Left Column: What you offer */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-black text-purple-400 tracking-wider border-b border-white/5 pb-1">
                  What you offer
                </span>

                <div>
                  <label className="text-[9px] uppercase block text-gray-500 mb-1 font-bold">Offer Cash: ₹{offeredCash.toLocaleString()}</label>
                  <input
                    type="range"
                    min={0}
                    max={localPlayer.money}
                    step={100}
                    value={offeredCash}
                    onChange={(e) => setOfferedCash(Number(e.target.value))}
                    className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase block text-gray-500 mb-1 font-bold mb-1.5">Offer Properties</label>
                  <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5 pr-1 no-scrollbar border border-white/5 rounded-xl p-2 bg-black/20">
                    {(localPlayer.properties || []).length === 0 ? (
                      <span className="text-[9px] text-gray-600 block text-center py-2 uppercase font-bold">No assets owned</span>
                    ) : (
                      (localPlayer.properties || []).map((pStr) => {
                        const tileIdx = parseInt(pStr);
                        const tile = BOARD_TILES[tileIdx];
                        return (
                          <label key={tileIdx} className="flex items-center gap-2 text-[10px] font-bold text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={offeredProperties.includes(tileIdx)}
                              onChange={() => toggleProperty(tileIdx, true)}
                              className="rounded border-white/10 accent-purple-500"
                            />
                            <span>{tile.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: What you request */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider border-b border-white/5 pb-1">
                  What you request
                </span>

                {selectedTargetPlayer && (
                  <>
                    <div>
                      <label className="text-[9px] uppercase block text-gray-500 mb-1 font-bold">Request Cash: ₹{requestedCash.toLocaleString()}</label>
                      <input
                        type="range"
                        min={0}
                        max={selectedTargetPlayer.money}
                        step={100}
                        value={requestedCash}
                        onChange={(e) => setRequestedCash(Number(e.target.value))}
                        className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase block text-gray-500 mb-1 font-bold mb-1.5">Request Properties</label>
                      <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5 pr-1 no-scrollbar border border-white/5 rounded-xl p-2 bg-black/20">
                        {(selectedTargetPlayer.properties || []).length === 0 ? (
                          <span className="text-[9px] text-gray-600 block text-center py-2 uppercase font-bold">No assets owned</span>
                        ) : (
                          (selectedTargetPlayer.properties || []).map((pStr) => {
                            const tileIdx = parseInt(pStr);
                            const tile = BOARD_TILES[tileIdx];
                            return (
                              <label key={tileIdx} className="flex items-center gap-2 text-[10px] font-bold text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={requestedProperties.includes(tileIdx)}
                                  onChange={() => toggleProperty(tileIdx, false)}
                                  className="rounded border-white/10 accent-cyan-500"
                                />
                                <span>{tile.name}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!selectedPlayerId}
            className={`w-full py-3.5 rounded-xl font-bold tracking-widest text-white transition-all uppercase text-xs mt-3 ${
              selectedPlayerId
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 cursor-pointer shadow-lg shadow-purple-500/20'
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Send Trade Proposal
          </button>
        </form>

      </div>
    </div>
  );
};
