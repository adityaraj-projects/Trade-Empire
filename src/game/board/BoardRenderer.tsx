import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, BoardTile, TradeProposal } from '../../types/game';
import { BOARD_TILES } from '../../constants/boardData';
import { TileRenderer } from './TileRenderer';
import { TokenList } from '../player/TokenList';
import { DiceContainer } from '../dice/DiceContainer';
import { ActionPanel } from '../../components/ActionPanel';
import { AssetManager } from '../../components/AssetManager';
import { PLAYER_COLOR_MAP } from '../../components/PlayerList';
import { Info, LogOut } from 'lucide-react';
import { ChatOverlay } from '../../components/ChatOverlay';
import { AuctionPanel } from '../../components/AuctionPanel';
import { TradeModal } from '../../components/TradeModal';

import { playDiceRollSound, playCoinSound, playSuccessSound } from '../../utils/audio';

interface BoardRendererProps {
  gameState: GameState;
  pendingAction: any;
  diceRolling: boolean;
  activePlayer: Player;
  soundEnabled?: boolean;
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

const GROUP_COLOR_MAP: { [key: string]: string } = {
  brown: 'bg-amber-800 text-white',
  cyan: 'bg-cyan-600 text-white',
  pink: 'bg-pink-600 text-white',
  orange: 'bg-orange-600 text-white',
  red: 'bg-red-600 text-white',
  yellow: 'bg-yellow-500 text-slate-900',
  green: 'bg-emerald-600 text-white',
  blue: 'bg-blue-600 text-white',
  railway: 'bg-slate-700 text-white',
  utility: 'bg-indigo-600 text-white',
  tax: 'bg-rose-700 text-white',
};

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
  soundEnabled = true,
}) => {
  const [tradeOpen, setTradeOpen] = useState(false);
  const [deedTile, setDeedTile] = useState<BoardTile | null>(null);

  // Play dice rolling sound
  useEffect(() => {
    if (diceRolling) {
      playDiceRollSound(soundEnabled);
    }
  }, [diceRolling, soundEnabled]);

  // Play coin / success sounds depending on game feeds update logs
  const prevLogsLengthRef = useRef(0);
  useEffect(() => {
    const logs = gameState.logs || [];
    if (prevLogsLengthRef.current > 0 && logs.length > prevLogsLengthRef.current) {
      const latestLog = logs[logs.length - 1]; // Log feeds are appended at the end of logs array
      if (latestLog) {
        const msgText = latestLog.message.toLowerCase();
        if (
          msgText.includes('bought') || 
          msgText.includes('paid') || 
          msgText.includes('received') ||
          msgText.includes('tax')
        ) {
          playCoinSound(soundEnabled);
        } else if (
          msgText.includes('build') ||
          msgText.includes('won') ||
          msgText.includes('pass')
        ) {
          playSuccessSound(soundEnabled);
        }
      }
    }
    prevLogsLengthRef.current = logs.length;
  }, [gameState.logs, soundEnabled]);

  useEffect(() => {
    const handleShowDeed = (e: Event) => {
      const tile = (e as CustomEvent).detail as BoardTile;
      setDeedTile(tile);
    };
    const handleOpenTrade = () => setTradeOpen(true);

    window.addEventListener('SHOW_DEED_INFO', handleShowDeed);
    window.addEventListener('TRIGGER_MOBILE_TRADE', handleOpenTrade);
    return () => {
      window.removeEventListener('SHOW_DEED_INFO', handleShowDeed);
      window.removeEventListener('TRIGGER_MOBILE_TRADE', handleOpenTrade);
    };
  }, []);

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
    <div className="relative w-full max-w-[min(100vw-24px,min(50vh,420px))] md:max-w-[min(100%,82vh,880px)] min-h-[240px] md:min-h-[320px] aspect-square bg-[#131520] border border-white/10 rounded-[8px] md:rounded-2xl p-[3px] md:p-3 shadow-2xl flex flex-col justify-between overflow-hidden">
      
      {/* 1. TOP ROW OF TILES */}
      <div className="h-[12.5%] flex gap-[2px] md:gap-1">
        <TileRenderer tile={cornerTopLeft} {...getTileRenderProps(cornerTopLeft)}>
          <TokenList players={gameState.players.filter(p => p.position === cornerTopLeft.index && !p.isBankrupt)} />
        </TileRenderer>
        {topSides.map(t => (
          <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)}>
            <TokenList players={gameState.players.filter(p => p.position === t.index && !p.isBankrupt)} />
          </TileRenderer>
        ))}
        <TileRenderer tile={cornerTopRight} {...getTileRenderProps(cornerTopRight)}>
          <TokenList players={gameState.players.filter(p => p.position === cornerTopRight.index && !p.isBankrupt)} />
        </TileRenderer>
      </div>

      {/* 2. MIDDLE ROW OF SIDE TILES AND INNER CENTER BOX */}
      <div className="flex-1 flex gap-[2px] md:gap-1 py-[2px] md:py-1">
        {/* Left column (going down) */}
        <div className="w-[12.5%] flex flex-col gap-[2px] md:gap-1 justify-between">
          {leftTiles.map(t => (
            <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)}>
              <TokenList players={gameState.players.filter(p => p.position === t.index && !p.isBankrupt)} />
            </TileRenderer>
          ))}
        </div>

        {/* INNER BOARD CENTER ACTIONS BOARD */}
        <div className="flex-1 bg-[#181a26] rounded-[6px] md:rounded-xl border border-white/5 p-1.5 md:p-4 flex flex-col justify-between relative shadow-inner">
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
          {!pendingAction && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: PLAYER_COLOR_MAP[activePlayer?.color || 'purple'] }}
                  ></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium">Active Turn</span>
                    <h2 className="text-xs md:text-sm font-extrabold text-gray-100 uppercase tracking-wide leading-tight">
                      {activePlayer?.name || 'Player'}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Session
                  </span>
                </div>
              </div>

              {/* Dice + Feeds split area */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-center py-1 md:py-2 overflow-hidden min-h-0">
                <div className="flex flex-col items-center justify-center md:border-r border-white/5 pr-0 md:pr-4 h-full w-full">
                  <DiceContainer
                    dice={gameState.dice}
                    rolling={diceRolling}
                    onRoll={onRollDice}
                    disabled={gameState.isDiceRolled || !!pendingAction || !isLocalTurn}
                  />
                  
                  <div className="flex flex-row md:flex-col gap-1.5 md:gap-2 mt-2 md:mt-3 items-center shrink-0">
                    {gameState.isDiceRolled && !pendingAction && isLocalTurn && (
                      <button
                        onClick={onEndTurn}
                        className="w-28 md:w-32 py-1.5 md:py-2.5 btn-supercell btn-supercell-purple text-[8px] md:text-[9px] uppercase font-black tracking-widest text-white"
                      >
                        End Turn
                      </button>
                    )}
                    {isLocalTurn && !pendingAction && (
                      <button
                        onClick={() => setTradeOpen(true)}
                        className="hidden md:block w-32 py-2.5 btn-supercell btn-supercell-cyan text-[9px] uppercase font-black tracking-widest text-white"
                      >
                        Trade Assets
                      </button>
                    )}
                  </div>
                </div>

              </div>

              <div className="hidden md:flex items-center gap-2 border-t border-white/5 pt-2 text-[10px] text-gray-500 font-semibold justify-center shrink-0">
                <Info className="w-3.5 h-3.5 text-gray-600" />
                <span>Board v2.0 — Fully responsive</span>
              </div>
            </div>
          )}

        </div>

        {/* Right column (going up) */}
        <div className="w-[12.5%] flex flex-col gap-1 justify-between">
          {rightTiles.map(t => (
            <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)}>
              <TokenList players={gameState.players.filter(p => p.position === t.index && !p.isBankrupt)} />
            </TileRenderer>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM ROW OF TILES */}
      <div className="h-[12.5%] flex gap-[2px] md:gap-1">
        <TileRenderer tile={cornerBottomRight} {...getTileRenderProps(cornerBottomRight)}>
          <TokenList players={gameState.players.filter(p => p.position === cornerBottomRight.index && !p.isBankrupt)} />
        </TileRenderer>
        {bottomSides.map(t => (
          <TileRenderer key={t.index} tile={t} {...getTileRenderProps(t)}>
            <TokenList players={gameState.players.filter(p => p.position === t.index && !p.isBankrupt)} />
          </TileRenderer>
        ))}
        <TileRenderer tile={cornerBottomLeft} {...getTileRenderProps(cornerBottomLeft)}>
          <TokenList players={gameState.players.filter(p => p.position === cornerBottomLeft.index && !p.isBankrupt)} />
        </TileRenderer>
      </div>

      {/* Floating Chat Overlay - use localPlayer for chat identity, not turn player */}
      <ChatOverlay roomId={gameState.roomId} activePlayer={gameState.players.find(p => p.id === localPlayerId) || activePlayer} players={gameState.players} />

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

      {/* Interactive Tile Deed Details Modal */}
      {deedTile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xs rounded-[24px] border border-white/10 bg-[#0d0e12]/95 p-5 shadow-2xl flex flex-col gap-4 text-center overflow-hidden animate-scale-up">
            {/* Top Color strip */}
            <div className={`absolute top-0 left-0 right-0 h-4 ${GROUP_COLOR_MAP[deedTile.details?.group || deedTile.type] || 'bg-slate-700'}`}></div>

            {/* Header */}
            <div className="mt-2">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">TITLE DEED</span>
              <h3 className="text-base font-black text-white uppercase tracking-wide mt-1">{deedTile.name}</h3>
            </div>

            {/* Stats Panel */}
            <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5 text-left text-xs text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-semibold text-gray-400">Purchase Price:</span>
                <span className="font-extrabold text-cyan-400">₹{(deedTile.details?.cost || deedTile.cost || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-semibold text-gray-400">Mortgage Value:</span>
                <span className="font-extrabold text-amber-500">
                  ₹{deedTile.details ? deedTile.details.mortgage.toLocaleString() : Math.floor((deedTile.cost || 0) / 2).toLocaleString()}
                </span>
              </div>

              {deedTile.details && deedTile.details.houseCost > 0 ? (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="font-semibold text-gray-400">House Build Cost:</span>
                  <span className="font-extrabold text-emerald-400">₹{deedTile.details.houseCost.toLocaleString()} each</span>
                </div>
              ) : null}

              {/* Rent structure list */}
              {deedTile.details ? (
                <div className="flex flex-col gap-1.5 pt-1 text-[11px]">
                  <span className="font-black text-gray-400 uppercase tracking-wider text-[8px] mb-1">Rent Schedule</span>
                  <div className="flex justify-between">
                    <span>Base Rent:</span>
                    <span className="font-bold text-gray-200">₹{deedTile.details.rent.toLocaleString()}</span>
                  </div>
                  {deedTile.details.houseCost > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>With 1 House:</span>
                        <span className="font-bold text-gray-200">₹{deedTile.details.rent1.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With 2 Houses:</span>
                        <span className="font-bold text-gray-200">₹{deedTile.details.rent2.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With 3 Houses:</span>
                        <span className="font-bold text-gray-200">₹{deedTile.details.rent3.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With 4 Houses:</span>
                        <span className="font-bold text-gray-200">₹{deedTile.details.rent4.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-yellow-400 font-extrabold border-t border-white/5 pt-1">
                        <span>With Hotel (5 Houses):</span>
                        <span>₹{deedTile.details.hotel.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  {deedTile.type === 'railway' && (
                    <>
                      <div className="flex justify-between">
                        <span>With 2 Railways Owned:</span>
                        <span className="font-bold text-gray-200">₹500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With 3 Railways Owned:</span>
                        <span className="font-bold text-gray-200">₹1,000</span>
                      </div>
                      <div className="flex justify-between text-yellow-400 font-extrabold border-t border-white/5 pt-1">
                        <span>With 4 Railways Owned:</span>
                        <span>₹2,000</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                deedTile.type === 'tax' && (
                  <div className="flex flex-col gap-1 text-[11px] text-rose-300">
                    <span>This is a government tax sector. Landing here requires payment of the specified tax amount immediately to the treasury bank.</span>
                  </div>
                )
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => setDeedTile(null)}
              className="w-full py-3 btn-supercell btn-supercell-purple font-black text-xs uppercase tracking-widest text-white mt-1"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
