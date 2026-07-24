import React from 'react';
import { GameState, Player, TradeProposal } from '../types/game';
import { BoardRenderer } from '../game/board/BoardRenderer';

interface GameBoardProps {
  soundEnabled?: boolean;
  gameState: GameState;
  pendingAction: any;
  diceRolling: boolean;
  activePlayer: Player;
  localPlayerId: string;
  hostId: string;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onDeclineProperty: () => void;
  onPayRent: () => void;
  onPayTax: () => void;
  onConfirmCard: () => void;
  onDeclareBankruptcy: () => void;
  onBuildHouse: (tileIndex: number) => void;
  onSellHouse: (tileIndex: number) => void;
  onMortgage: (tileIndex: number) => void;
  onUnmortgage: (tileIndex: number) => void;
  onEndTurn: () => void;
  
  // Auction Triggers
  onBid: (amount: number) => void;
  onPassBid: () => void;
  
  // Trade Proposals
  onProposeTrade: (proposal: TradeProposal) => void;
  onAcceptTrade: () => void;
  onDeclineTrade: () => void;

  onOpenAssetManager: (player: Player) => void;
  onCloseAssetManager: () => void;
  managingPlayer: Player | null;
}

export const GameBoard: React.FC<GameBoardProps> = (props) => {
  return <BoardRenderer {...props} />;
};
