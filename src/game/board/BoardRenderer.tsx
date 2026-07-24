import React, { useState } from 'react';
import { GameState, Player, BoardTile, TradeProposal } from '../../types/game';
import { BOARD_TILES } from '../../constants/boardData';
import { TileRenderer } from './TileRenderer';
import { TokenList } from '../player/TokenList';
import { DiceContainer } from '../dice/DiceContainer';
import { ActionPanel } from '../../components/ActionPanel';
import { AssetManager } from '../../components/AssetManager';
import { GameLogs } from '../../components/GameLogs';
import { PLAYER_COLOR_MAP } from '../../components/PlayerList';
import { Info, LogOut } from 'lucide-react';
import { ChatOverlay } from '../../components/ChatOverlay';
import { AuctionPanel } from '../../components/AuctionPanel';
import { TradeModal } from '../../components/TradeModal';

interface BoardRendererProps {
  gameState: GameState;
  pendingAction: any;
  diceRolling: boolean;
  activePlayer: Player;
  localPlayerId: string;
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

export const BoardRenderer: React.FC<BoardRendererProps> = ({
  gameState,
  pendingAction,
  diceRolling,
  activePlayer,
  localPlayerId,
  onRollDice,
  onBuyProperty,
  onDeclineProperty,
  onPayRent,
  onPayTax,
  onConfirmCard,
  onDeclareBankruptcy,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  onEndTurn,
  onBid,
  onPassBid,
  onProposeTrade,
  onAcceptTrade,
  onDeclineTrade,
  onOpenAssetManager,
  onCloseAssetManager,
  managingPlayer,
}) => {
  const [tradeOpen, setTradeOpen] = useState(false);

  // Group tiles by edges
  const tilesToRender = gameState.tiles || BOARD_TILES;
  const bottomTiles = tilesToRender.slice(0, 11).reverse();
  const leftTiles = tilesToRender.slice(11, 20).reverse();
  const topTiles = tilesToRender.slice(20, 31);
  const rightTiles = tilesToRender.slice(31, 40);

  // Split corner and side tiles for styling
  const cornerBottomLeft = bottomTiles[0];
  const cornerBottomRight = bottomTiles[10];
  const cornerTopLeft = topTiles[0];
  const cornerTopRight = topTiles[10];

  const bottomSides = bottomTiles.slice(1, 10);
  const topSides = topTiles.slice(1, 10);

  const isLocalTurn = activePlayer?.id === localPlayerId;

  // Helper to resolve parameters for TileRenderer dynamically
  const getTileRenderProps = (tile: BoardTile) => {
    const owner = gameState.players.find(p => 
      (p.properties || []).includes(tile.index.toString()) || 
      (p.properties || []).includes(tile.index.toString() + 'm')
    );

    const isMortgaged = owner ? (owner.properties || []).includes(tile.index.toString() + 'm') : false;
    const houseCount = owner ? (owner.houses || {})[tile.index] || 0 : 0;
    const ownerColor = owner ? PLAYER_COLOR_MAP[owner.color] : undefined;

    let orientationClass = 'flex-col';
    let colorBarClass = 'h-3 w-full';

    if (tile.index >= 0 && tile.index <= 10) {
      orientationClass = 'flex-col justify-between';
      colorBarClass = 'h-2.5 w-full border-b border-white/5';
    } else if (tile.index >= 11 && tile.index <= 19) {
      orientationClass = 'flex-row-reverse justify-between';
      colorBarClass = 'w-2.5 h-full border-l border-white/5';
    } else if (tile.index >= 20 && tile.index <= 30) {
      orientationClass = 'flex-col-reverse justify-between';
      colorBarClass = 'h-2.5 w-full border-t border-white/5';
    } else if (tile.index >= 31 && tile.index <= 39) {
      orientationClass = 'flex-row justify-between';
      colorBarClass = 'w-2.5 h-full border-r border-white/5';
    }

    return {
      isMortgaged,
      houseCount,
      ownerColor,
      orientationClass,
      colorBarClass
    };
  };

  return (
    <div className="relative w-full max-w-[620px] aspect-square bg-[#131520] border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col justify-between overflow-hidden">
      
      {/* 1. TOP ROW OF TILES */}
      <div className="h-[12.5%] flex gap-1">
        <TileRenderer tile={cornerTopLeft} {...getTileRenderProps(cornerTopLeft)} />
        {topSides.map(t => (
          <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)} />
        ))}
        <TileRenderer tile={cornerTopRight} {...getTileRenderProps(cornerTopRight)} />
      </div>

      {/* 2. MIDDLE ROW OF SIDE TILES AND INNER CENTER BOX */}
      <div className="flex-1 flex gap-1 py-1">
        {/* Left column (going down) */}
        <div className="w-[12.5%] flex flex-col gap-1 justify-between">
          {leftTiles.map(t => (
            <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)} />
          ))}
        </div>

        {/* INNER BOARD CENTER ACTIONS BOARD */}
        <div className="flex-1 bg-[#181a26] rounded-xl border border-white/5 p-4 flex flex-col justify-between relative shadow-inner">
          {managingPlayer && (
            <AssetManager
              player={managingPlayer}
              onClose={onCloseAssetManager}
              onBuildHouse={onBuildHouse}
              onSellHouse={onSellHouse}
              onMortgage={onMortgage}
              onUnmortgage={onUnmortgage}
            />
          )}

          <ActionPanel
            pendingAction={pendingAction}
            activePlayer={activePlayer}
            players={gameState.players}
            onBuy={onBuyProperty}
            onDecline={onDeclineProperty}
            onPayRent={onPayRent}
            onPayTax={onPayTax}
            onConfirmCard={onConfirmCard}
            onDeclareBankruptcy={onDeclareBankruptcy}
          />

          {/* Normal controller UI */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: PLAYER_COLOR_MAP[activePlayer?.color || 'purple'] }}
                ></div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Active Turn</span>
                  <h2 className="text-sm md:text-base font-extrabold text-gray-100 uppercase tracking-wide leading-tight">
                    {activePlayer?.name || 'Player'}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded font-bold uppercase tracking-wider">
                  Session
                </span>
              </div>
            </div>

            {/* Dice + Feeds split area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-4 overflow-hidden">
              <div className="flex flex-col items-center justify-center border-r border-white/5 pr-0 md:pr-4 h-full">
                <DiceContainer
                  dice={gameState.dice}
                  rolling={diceRolling}
                  onRoll={onRollDice}
                  disabled={gameState.isDiceRolled || !!pendingAction || !isLocalTurn}
                />
                
                <div className="flex flex-col gap-3 mt-4 items-center">
                  {gameState.isDiceRolled && !pendingAction && isLocalTurn && (
                    <button
                      onClick={onEndTurn}
                      className="w-36 py-3 btn-supercell btn-supercell-purple text-[10px] uppercase font-black tracking-widest text-white"
                    >
                      End Turn
                    </button>
                  )}
                  {isLocalTurn && !pendingAction && (
                    <button
                      onClick={() => setTradeOpen(true)}
                      className="w-36 py-3 btn-supercell btn-supercell-cyan text-[10px] uppercase font-black tracking-widest text-white"
                    >
                      Trade Assets
                    </button>
                  )}
                </div>
              </div>

              <div className="h-full overflow-hidden max-h-[14rem]">
                <GameLogs logs={gameState.logs} />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-white/5 pt-2 text-[10px] text-gray-500 font-semibold justify-center">
              <Info className="w-3.5 h-3.5 text-gray-600" />
              <span>Clean Architecture: decoupled renderer nodes. Fully data-driven board tiles.</span>
            </div>
          </div>

        </div>

        {/* Right column (going up) */}
        <div className="w-[12.5%] flex flex-col gap-1 justify-between">
          {rightTiles.map(t => (
            <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)} />
          ))}
        </div>
      </div>

      {/* 3. BOTTOM ROW OF TILES */}
      <div className="h-[12.5%] flex gap-1">
        <TileRenderer tile={cornerBottomRight} {...getTileRenderProps(cornerBottomRight)} />
        {bottomSides.map(t => (
          <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)} />
        ))}
        <TileRenderer tile={cornerBottomLeft} {...getTileRenderProps(cornerBottomLeft)} />
      </div>

      {/* Floating Chat Overlay */}
      <ChatOverlay roomId={gameState.roomId} activePlayer={activePlayer} logs={gameState.logs} />

      {/* Dynamic Overlays: Trade Proposer / Receiver */}
      {(tradeOpen || gameState.pendingTrade) && (
        <TradeModal
          players={gameState.players}
          localPlayerId={localPlayerId}
          pendingTrade={gameState.pendingTrade || null}
          onProposeTrade={(proposal) => {
            onProposeTrade(proposal);
            setTradeOpen(false);
          }}
          onAcceptTrade={onAcceptTrade}
          onDeclineTrade={onDeclineTrade}
          onClose={() => setTradeOpen(false)}
        />
      )}

      {/* Dynamic Overlays: Property Auction */}
      {gameState.auction && (
        <AuctionPanel
          auction={gameState.auction}
          players={gameState.players}
          localPlayerId={localPlayerId}
          onBid={onBid}
          onPass={onPassBid}
        />
      )}

    </div>
  );
};
