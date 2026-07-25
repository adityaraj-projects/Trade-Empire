import React from 'react';
import { PendingActionType } from '../hooks/useGameEngine';
import { Player } from '../types/game';
import { BOARD_TILES } from '../constants/boardData';
import { DollarSign, ShieldAlert, Sparkles, Building2, Landmark, X } from 'lucide-react';
import { PLAYER_COLOR_MAP } from './PlayerList';
import { GROUP_COLOR_MAP } from '../utils/gridHelper';

interface ActionPanelProps {
  pendingAction: PendingActionType;
  activePlayer: Player;
  players: Player[];
  isLocalTurn?: boolean;
  onBuy: () => void;
  onDecline: () => void;
  onPayRent: () => void;
  onPayTax: () => void;
  onConfirmCard: () => void;
  onDeclareBankruptcy: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  pendingAction,
  activePlayer,
  players,
  isLocalTurn = true,
  onBuy,
  onDecline,
  onPayRent,
  onPayTax,
  onConfirmCard,
  onDeclareBankruptcy,
}) => {
  if (!pendingAction) return null;

  if (!isLocalTurn) {
    const tileIndex = 'tileIndex' in pendingAction ? (pendingAction as any).tileIndex : undefined;
    const tileName = tileIndex !== undefined ? BOARD_TILES[tileIndex]?.name : 'property';

    return (
      <div className="flex flex-col items-center justify-center text-center p-3 md:p-4 max-w-[14rem] md:max-w-[16rem] mx-auto animate-fade-in">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-pulse">
          <Building2 className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <span className="text-[8px] md:text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">
          Turn In Progress
        </span>
        <h3 className="text-xs md:text-sm font-black text-gray-200 uppercase tracking-wide mt-0.5">
          {activePlayer.name}'s Action
        </h3>
        <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-semibold leading-relaxed">
          {pendingAction.type === 'buy_or_decline' && `Deciding whether to buy ${tileName}...`}
          {pendingAction.type === 'pay_rent' && `Paying ₹${pendingAction.rentAmount.toLocaleString()} rent...`}
          {pendingAction.type === 'pay_tax' && `Paying ₹${pendingAction.taxAmount.toLocaleString()} tax...`}
          {pendingAction.type === 'draw_card' && `Reading drawn card...`}
          {pendingAction.type === 'bankruptcy_warning' && `Resolving financial deficit...`}
        </p>
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-gray-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Waiting for {activePlayer.name}...</span>
        </div>
      </div>
    );
  }

  const getOverlay = () => {
    switch (pendingAction.type) {
      case 'buy_or_decline': {
        const tile = BOARD_TILES[pendingAction.tileIndex];
        const cost = tile.details?.cost || tile.cost || 0;
        const details = tile.details;
        const hasEnoughMoney = activePlayer.money >= cost;

        return (
          <div className="flex flex-col items-center justify-center text-center p-1 md:p-4 my-auto relative">
            {/* Top Right Close X Button */}
            <button
              onClick={onDecline}
              className="absolute -top-1 -right-1 p-1 md:p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
              title="Decline / Close"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>

            <div className="p-1.5 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl text-purple-400 border border-purple-500/20 mb-1 md:mb-3 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
              <Building2 className="w-5 h-5 md:w-8 md:h-8" />
            </div>
            
            <span className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-wider">Opportunity</span>
            <h3 className="text-xs md:text-lg font-black mt-0.5 md:mt-1 text-gray-200 uppercase tracking-wide">Buy {tile.name}?</h3>

            {/* Property details card */}
            {details && (
              <div className="w-full max-w-[12rem] md:max-w-[15rem] mt-1.5 md:mt-4 mb-2 md:mb-5 rounded-xl md:rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
                <div className={`py-1 md:py-2 px-2 md:px-3 text-[9px] md:text-xs font-black text-center uppercase tracking-wider ${GROUP_COLOR_MAP[details.group]}`}>
                  {tile.name}
                </div>
                <div className="p-1.5 md:p-3 text-[8px] md:text-[10px] text-gray-400 flex flex-col gap-0.5 md:gap-1.5 text-left bg-white/2">
                  <div className="flex justify-between">
                    <span>Base Rent:</span>
                    <span className="font-extrabold text-gray-200">₹{details.rent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With 1 House:</span>
                    <span className="font-bold text-gray-200">₹{details.rent1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With Hotel:</span>
                    <span className="font-black text-cyan-400">₹{details.hotel}</span>
                  </div>
                  <div className="border-t border-white/5 my-0.5 md:my-1 pt-1 flex justify-between font-black text-gray-200 text-[9px] md:text-xs">
                    <span>Purchase Cost:</span>
                    <span>₹{cost}</span>
                  </div>
                </div>
              </div>
            )}

            {!details && (
              <p className="text-[9px] md:text-xs font-black text-cyan-400 mt-1 md:mt-2 mb-2 md:mb-5 bg-cyan-950/20 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full border border-cyan-500/20">
                Purchase Price: ₹{cost}
              </p>
            )}

            <div className="flex gap-1.5 md:gap-3 w-full justify-center">
              <button
                onClick={onBuy}
                disabled={!hasEnoughMoney}
                className={`btn-supercell flex-1 py-2 md:py-3.5 text-[9px] md:text-xs font-black uppercase transition-all ${
                  hasEnoughMoney
                    ? 'btn-supercell-green shadow-[0_4px_0_#166534]'
                    : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
                }`}
              >
                Buy (₹{cost})
              </button>

              <button
                onClick={onDecline}
                className="btn-supercell btn-supercell-purple flex-1 py-2 md:py-3.5 text-[9px] md:text-xs font-black uppercase shadow-[0_4px_0_#581c87]"
              >
                Auction
              </button>
            </div>
          </div>
        );
      }

      case 'pay_rent': {
        const tile = BOARD_TILES[pendingAction.tileIndex];
        const { rentAmount, ownerId } = pendingAction;
        const owner = players.find(p => p.id === ownerId)!;

        return (
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3.5 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20 mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
              <DollarSign className="w-8 h-8" />
            </div>

            <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider">Rent Due</span>
            <h3 className="text-lg font-black mt-1 text-gray-200 uppercase tracking-wide">Rent Payment</h3>
            
            <p className="text-xs text-gray-400 mt-2 max-w-[18rem] leading-relaxed">
              Landed on <span className="font-extrabold text-purple-300">{tile.name}</span>, owned by{' '}
              <span className="font-black" style={{ color: PLAYER_COLOR_MAP[owner.color] }}>{owner.name}</span>.
            </p>

            <div className="mt-4 mb-5 px-5 py-3 bg-rose-500/5 border border-rose-500/15 rounded-2xl shadow-inner">
              <span className="text-[9px] text-gray-500 block font-black uppercase tracking-wider">Rent Amount</span>
              <span className="text-2xl font-black text-rose-400 font-mono">₹{rentAmount.toLocaleString()}</span>
            </div>

            <button
              onClick={onPayRent}
              className="btn-supercell btn-supercell-red w-full py-4 text-xs font-black uppercase shadow-lg text-white"
            >
              Pay Rent
            </button>
          </div>
        );
      }

      case 'pay_tax': {
        const tile = BOARD_TILES[pendingAction.tileIndex];
        const { taxAmount } = pendingAction;

        return (
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 mb-3 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              <Landmark className="w-8 h-8" />
            </div>

            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Government Charge</span>
            <h3 className="text-lg font-black mt-1 text-gray-200 uppercase tracking-wide">
              {tile.name === 'JAIL' ? 'Jail Fine Due' : `${tile.name} Due`}
            </h3>

            <p className="text-xs text-gray-400 mt-2 max-w-[18rem] leading-relaxed">
              {pendingAction.tileIndex === 18 
                ? 'To secure your release from jail immediately, you must pay fine.'
                : `Land on tax cell requires payment of duty.`}
            </p>

            <div className="mt-4 mb-5 px-5 py-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl shadow-inner">
              <span className="text-[9px] text-gray-500 block font-black uppercase tracking-wider">Tax Amount</span>
              <span className="text-2xl font-black text-amber-400 font-mono">₹{taxAmount.toLocaleString()}</span>
            </div>

            <button
              onClick={onPayTax}
              className="btn-supercell btn-supercell-yellow w-full py-4 text-xs font-black uppercase shadow-lg text-slate-900"
            >
              Pay Bank
            </button>
          </div>
        );
      }

      case 'draw_card': {
        const { cardType, cardText } = pendingAction;
        const isVyapaar = cardType === 'vyapaar';

        return (
          <div className="flex flex-col items-center text-center p-4">
            <div className={`p-3.5 rounded-2xl mb-3 border ${
              isVyapaar 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
            }`}>
              <Sparkles className="w-8 h-8" />
            </div>

            <span className={`text-[10px] font-black uppercase tracking-wider ${isVyapaar ? 'text-cyan-400' : 'text-purple-400'}`}>
              {isVyapaar ? 'Vyapaar Card' : 'Chance Card'}
            </span>
            
            <div className="mt-4 mb-5 p-4.5 rounded-2xl border border-white/5 bg-black/40 shadow-inner w-full min-h-[5rem] flex items-center justify-center leading-relaxed">
              <p className="text-xs font-extrabold text-gray-200 text-center max-w-[16rem]">
                {cardText}
              </p>
            </div>

            <button
              onClick={onConfirmCard}
              className={`btn-supercell w-full py-4 text-xs font-black uppercase text-white shadow-lg ${
                isVyapaar 
                  ? 'btn-supercell-cyan' 
                  : 'btn-supercell-purple'
              }`}
            >
              OK, Continue
            </button>
          </div>
        );
      }

      case 'bankruptcy_warning': {
        const { owedTo, amount } = pendingAction;
        const recipientName = owedTo === 'bank' ? 'the Bank' : players.find(p => p.id === owedTo)?.name || 'Owner';

        return (
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3.5 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 mb-3 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <span className="text-[10px] text-red-500 font-black uppercase tracking-wider">Alert</span>
            <h3 className="text-lg font-black mt-1 text-gray-200 uppercase tracking-wide">Bankruptcy Warning</h3>

            <p className="text-xs text-gray-400 mt-2 max-w-[18rem] leading-relaxed">
              You owe <span className="font-extrabold text-red-400">₹{amount.toLocaleString()}</span> to {recipientName}, but you only have{' '}
              <span className="font-black text-cyan-400">₹{activePlayer.money.toLocaleString()}</span>.
            </p>

            <p className="text-[10px] text-gray-500 mt-3 mb-5 max-w-[16rem] leading-relaxed">
              To raise funds, close this overlay and manage assets: sell houses, mortgage properties. If you cannot raise enough, you must declare bankruptcy.
            </p>

            <button
              onClick={onDeclareBankruptcy}
              className="btn-supercell btn-supercell-red w-full py-4 text-xs font-black uppercase shadow-lg text-white"
            >
              Declare Bankruptcy
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 bg-[#06070a]/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 z-20">
      <div className="w-full max-w-[20rem] glass-card border border-white/10 p-5 shadow-2xl relative bg-slate-900/90">
        {getOverlay()}
      </div>
    </div>
  );
};
export default ActionPanel;
