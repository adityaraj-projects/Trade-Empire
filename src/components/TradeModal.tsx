import React, { useState } from 'react';
import { Player, TradeProposal } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { RefreshCw, ArrowRightLeft, Check, X, ShieldAlert, Edit3, Send } from 'lucide-react';
import { useHardwareBack } from '../hooks/useHardwareBack';

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
  useHardwareBack('tradeModal', true, onClose);

  const localPlayer = players.find(p => p.id === localPlayerId);
  const otherPlayers = players.filter(p => p.id !== localPlayerId && !p.isBankrupt);

  const isReceiver = pendingTrade?.receiverId === localPlayerId;
  const isSender = pendingTrade?.senderId === localPlayerId;

  // Counter-offer edit mode toggle
  const [isCountering, setIsCountering] = useState<boolean>(false);

  // Proposer creation states
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    otherPlayers[0]?.id || ''
  );

  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [requestedCash, setRequestedCash] = useState<number>(0);
  const [offeredProperties, setOfferedProperties] = useState<number[]>([]);
  const [requestedProperties, setRequestedProperties] = useState<number[]>([]);

  const targetPlayer = players.find(p => p.id === selectedPlayerId);

  // If local player isn't involved in pending trade, don't show pending trade modal to third parties
  if (pendingTrade && !isReceiver && !isSender) {
    return null;
  }

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
    onClose();
  };

  const handleCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTrade) return;

    // Send counter offer (receiver becomes sender, sender becomes receiver)
    onProposeTrade({
      senderId: localPlayerId, // I am now proposing back
      receiverId: pendingTrade.senderId, // back to original sender
      offeredCash,
      offeredProperties,
      requestedCash,
      requestedProperties,
    });
    setIsCountering(false);
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

  const startEditCounter = () => {
    if (!pendingTrade) return;
    // Pre-fill counter offer form (what sender requested from me is now what I offer them, and vice versa)
    setSelectedPlayerId(pendingTrade.senderId);
    setOfferedCash(pendingTrade.requestedCash);
    setRequestedCash(pendingTrade.offeredCash);
    setOfferedProperties([...pendingTrade.requestedProperties]);
    setRequestedProperties([...pendingTrade.offeredProperties]);
    setIsCountering(true);
  };

  // IF RECEIVED PENDING PROPOSAL (Receiver or Sender View)
  if (pendingTrade && !isCountering) {
    const sender = players.find(p => p.id === pendingTrade.senderId)!;
    const receiver = players.find(p => p.id === pendingTrade.receiverId)!;

    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
        <div className="w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 text-gray-200 animate-scale-up">
          
          {/* Top Right Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-gray-100">Trade Proposal</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {sender?.name} ➔ {receiver?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 leading-relaxed text-xs">
            {/* Sender Offers */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4 shadow-sm">
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider block mb-1">
                {sender?.name} Offers (You Receive):
              </span>
              <p className="font-mono font-black text-white text-sm">₹{pendingTrade.offeredCash.toLocaleString()}</p>
              {pendingTrade.offeredProperties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pendingTrade.offeredProperties.map(idx => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase">
                      {BOARD_TILES[idx].name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sender Requests */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4 shadow-sm">
              <span className="text-[9px] uppercase font-black text-rose-400 tracking-wider block mb-1">
                {sender?.name} Requests (You Give):
              </span>
              <p className="font-mono font-black text-white text-sm">₹{pendingTrade.requestedCash.toLocaleString()}</p>
              {pendingTrade.requestedProperties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pendingTrade.requestedProperties.map(idx => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-black uppercase">
                      {BOARD_TILES[idx].name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isReceiver ? (
            <div className="flex flex-col gap-2 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onAcceptTrade}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black tracking-widest text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 text-white shadow-lg"
                >
                  <Check className="w-4 h-4" /> Accept Trade
                </button>
                <button
                  onClick={onDeclineTrade}
                  className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-black tracking-widest text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 text-white shadow-lg"
                >
                  <X className="w-4 h-4" /> Reject Trade
                </button>
              </div>

              {/* Counter Offer / Edit Button */}
              <button
                onClick={startEditCounter}
                className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 font-black tracking-widest text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 text-purple-300 transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" /> Edit & Counter-Offer
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-bold rounded-2xl text-center leading-relaxed mt-1 flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Waiting for {receiver?.name} to review proposal...</span>
            </div>
          )}

          {isSender && (
            <button
              onClick={onDeclineTrade}
              className="mt-1 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase font-black text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel Proposal
            </button>
          )}

        </div>
      </div>
    );
  }

  // CREATE / COUNTER-OFFER TRADE FORM
  const myProperties = BOARD_TILES.filter(t =>
    (localPlayer?.properties || []).includes(t.index.toString())
  );
  const targetProperties = targetPlayer
    ? BOARD_TILES.filter(t => (targetPlayer.properties || []).includes(t.index.toString()))
    : [];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 text-gray-200 animate-scale-up max-h-[90vh] overflow-hidden">
        
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-gray-100">
              {isCountering ? 'Counter-Offer Trade' : 'Propose Trade'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Asset Swapping Center</p>
          </div>
        </div>

        <form onSubmit={isCountering ? handleCounterOffer : handlePropose} className="flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar pr-1">
          
          {/* Target Player Select */}
          {!isCountering && (
            <div>
              <label className="block text-[9px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                Select Player to Trade With
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => {
                  setSelectedPlayerId(e.target.value);
                  setRequestedProperties([]);
                }}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-black text-white focus:outline-none focus:border-purple-500"
              >
                {otherPlayers.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.name} (₹{p.money.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trade Offer vs Request Side-by-Side */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            
            {/* YOU OFFER (Left Side) */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
              <div className="border-b border-white/5 pb-1">
                <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider">What You Offer</span>
                <p className="text-[8px] text-gray-500 font-bold">Assets & Cash you give to them</p>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-gray-400">Offer Cash:</span>
                  <span className="font-mono text-purple-300 font-black">₹{offeredCash.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={localPlayer?.money || 0}
                  step={500}
                  value={offeredCash}
                  onChange={(e) => setOfferedCash(Number(e.target.value))}
                  className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Offer Properties</span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto no-scrollbar">
                  {myProperties.length === 0 ? (
                    <span className="text-[9px] text-gray-600 font-bold italic py-1">No properties owned</span>
                  ) : (
                    myProperties.map(t => (
                      <label key={t.index} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5 cursor-pointer hover:border-purple-500/40 text-[9px] font-black text-gray-300">
                        <input
                          type="checkbox"
                          checked={offeredProperties.includes(t.index)}
                          onChange={() => toggleProperty(t.index, true)}
                          className="rounded accent-purple-500"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* YOU REQUEST (Right Side) */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
              <div className="border-b border-white/5 pb-1">
                <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">What You Request</span>
                <p className="text-[8px] text-gray-500 font-bold">Assets & Cash you ask from them</p>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-gray-400">Request Cash:</span>
                  <span className="font-mono text-cyan-300 font-black">₹{requestedCash.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={targetPlayer?.money || 0}
                  step={500}
                  value={requestedCash}
                  onChange={(e) => setRequestedCash(Number(e.target.value))}
                  className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Request Properties</span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto no-scrollbar">
                  {targetProperties.length === 0 ? (
                    <span className="text-[9px] text-gray-600 font-bold italic py-1">No properties owned</span>
                  ) : (
                    targetProperties.map(t => (
                      <label key={t.index} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5 cursor-pointer hover:border-cyan-500/40 text-[9px] font-black text-gray-300">
                        <input
                          type="checkbox"
                          checked={requestedProperties.includes(t.index)}
                          onChange={() => toggleProperty(t.index, false)}
                          className="rounded accent-cyan-500"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={!selectedPlayerId}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-black tracking-widest text-xs uppercase text-white transition-all active:scale-95 cursor-pointer shadow-lg mt-1 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" /> {isCountering ? 'Send Counter Proposal' : 'Send Trade Proposal'}
          </button>

        </form>

      </div>
    </div>
  );
};
