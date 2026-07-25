import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { useGameStore } from './store/useGameStore';
import { Home } from './pages/Home';
import { CreateRoom } from './pages/CreateRoom';
import { JoinRoom } from './pages/JoinRoom';
import { Lobby } from './pages/Lobby';
import { GameBoard } from './components/GameBoard';
import { PlayerList } from './components/PlayerList';
import { Player, TradeProposal } from './types/game';
import { Sparkles, MessageSquare, Send, Award, Volume2, VolumeX, LogOut, Briefcase, ListTodo, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { roomService } from './services/roomService';
import { GameLogs } from './components/GameLogs';
import { ChatWindow } from './components/ChatWindow';
import { BankruptcyModal } from './components/BankruptcyModal';
import { VictoryModal } from './components/VictoryModal';
import { SplashScreen } from './components/SplashScreen';
import { useHardwareBack, backManager } from './hooks/useHardwareBack';
import { motion, AnimatePresence } from 'framer-motion';
import { playChatPopSound } from './utils/audio';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const page = useGameStore((state) => state.page);
  const lobbyPlayers = useGameStore((state) => state.players);
  const resetRoom = useGameStore((state) => state.resetRoom);
  
  const roomId = useGameStore((state) => state.roomId);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const hostId = useGameStore((state) => state.hostId);
  const isHost = localPlayerId === hostId;

  const {
    gameState,
    pendingAction,
    diceRolling,
    activePlayer,
    initializeGame,
    rollDice,
    buyProperty,
    declineProperty,
    payRent,
    payTax,
    confirmCardAction,
    declareBankruptcy,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    sellHouse,
    endTurn,
    updateSettings,
    addLog,
    bidAuction,
    passBid,
    proposeTrade,
    acceptTrade,
    declineTrade,
    setGameState,
  } = useGameEngine();

  const [managingPlayer, setManagingPlayer] = useState<Player | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logsOpen, setLogsOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'feeds'>('chat');
  const [tabletUnread, setTabletUnread] = useState(false);
  const [dismissedBankruptcyModal, setDismissedBankruptcyModal] = useState(false);
  const prevTabletCountRef = useRef(0);

  // Register hardware back button for modals in App.tsx
  useHardwareBack('assetManager', !!managingPlayer, () => setManagingPlayer(null));
  useHardwareBack('gameLogs', logsOpen, () => setLogsOpen(false));

  // Hardware Back Button listener (Android & Mobile Browsers)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // 1. First attempt to close open modal/drawer
      const modalClosed = backManager.handleBack();
      if (modalClosed) return;

      // 2. If no modal was closed, handle page navigation step-by-step
      const currentPage = useGameStore.getState().page;
      if (currentPage !== 'home') {
        if (currentPage === 'create-room' || currentPage === 'join-room') {
          useGameStore.getState().setPage('home');
        } else if (currentPage === 'lobby' || currentPage === 'game-board') {
          const confirmQuit = window.confirm('Exit match and return to Main Menu?');
          if (confirmQuit) {
            useGameStore.getState().resetRoom();
          } else {
            window.history.pushState({ page: currentPage }, '');
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = roomService.syncChatMessages(roomId, (msgs) => {
      const chatMsgs = msgs || [];
      const nonOwn = chatMsgs.filter(m => m.senderId !== localPlayerId);
      if (prevTabletCountRef.current > 0 && nonOwn.length > prevTabletCountRef.current) {
        if (activeRightTab !== 'chat') {
          setTabletUnread(true);
          playChatPopSound(soundEnabled);
        }
      }
      prevTabletCountRef.current = nonOwn.length;
    });
    return () => unsubscribe();
  }, [roomId, activeRightTab, localPlayerId, soundEnabled]);

  useEffect(() => {
    if (activeRightTab === 'chat') {
      setTabletUnread(false);
    }
  }, [activeRightTab]);

  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'info' | 'chat' | 'success' }[]>([]);

  const addToast = useCallback((text: string, type: 'info' | 'chat' | 'success' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const prevLogsLengthRef = useRef(0);
  useEffect(() => {
    const logs = gameState.logs || [];
    prevLogsLengthRef.current = logs.length;
  }, [gameState.logs]);

  // Sync lobby players to game engine when launching the match
  useEffect(() => {
    if (page === 'game-board' && gameState.status === 'lobby') {
      initializeGame(
        lobbyPlayers.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        }))
      );
    }
  }, [page, gameState.status, lobbyPlayers, initializeGame]);

  // Sync client state from Firebase room snapshot
  useEffect(() => {
    if (!roomId || isHost || page !== 'game-board') return;

    const unsubscribe = roomService.syncRoom(roomId, (syncedState) => {
      if (syncedState && syncedState.status === 'playing') {
        setGameState(syncedState);
      }
    });
    return () => unsubscribe();
  }, [roomId, isHost, page, setGameState]);

  // Sync host state changes to database room snapshot
  useEffect(() => {
    if (!roomId || !isHost || page !== 'game-board') return;

    roomService.updateState(roomId, gameState);
  }, [gameState, roomId, isHost, page]);

  // Host authoritative request listener
  const actionsRef = useRef({
    rollDice,
    buyProperty,
    declineProperty,
    payRent,
    payTax,
    confirmCardAction,
    declareBankruptcy,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    endTurn,
    bidAuction,
    passBid,
    proposeTrade,
    acceptTrade,
    declineTrade,
  });
  useEffect(() => {
    actionsRef.current = {
      rollDice,
      buyProperty,
      declineProperty,
      payRent,
      payTax,
      confirmCardAction,
      declareBankruptcy,
      buildHouse,
      sellHouse,
      mortgageProperty,
      unmortgageProperty,
      endTurn,
      bidAuction,
      passBid,
      proposeTrade,
      acceptTrade,
      declineTrade,
    };
  });

  useEffect(() => {
    if (!roomId || !isHost || page !== 'game-board') return;

    const unsubscribe = roomService.syncRequests(roomId, (requests) => {
      if (!requests) return;

      Object.entries(requests).forEach(async ([reqId, packet]) => {
        switch (packet.type) {
          case 'REQ_ROLL_DICE':
            actionsRef.current.rollDice();
            break;
          case 'REQ_BUY_PROPERTY':
            actionsRef.current.buyProperty();
            break;
          case 'REQ_DECLINE_PROPERTY':
            actionsRef.current.declineProperty();
            break;
          case 'REQ_PAY_RENT':
            actionsRef.current.payRent();
            break;
          case 'REQ_PAY_TAX':
            actionsRef.current.payTax();
            break;
          case 'REQ_CONFIRM_CARD':
            actionsRef.current.confirmCardAction();
            break;
          case 'REQ_DECLARE_BANKRUPTCY':
            actionsRef.current.declareBankruptcy();
            break;
          case 'REQ_BUILD_HOUSE':
            if (packet.tileIndex !== undefined) actionsRef.current.buildHouse(packet.tileIndex);
            break;
          case 'REQ_SELL_HOUSE':
            if (packet.tileIndex !== undefined) actionsRef.current.sellHouse(packet.tileIndex);
            break;
          case 'REQ_MORTGAGE':
            if (packet.tileIndex !== undefined) actionsRef.current.mortgageProperty(packet.tileIndex);
            break;
          case 'REQ_UNMORTGAGE':
            if (packet.tileIndex !== undefined) actionsRef.current.unmortgageProperty(packet.tileIndex);
            break;
          case 'REQ_END_TURN':
            actionsRef.current.endTurn();
            break;
          case 'REQ_BID':
            if (packet.amount !== undefined) actionsRef.current.bidAuction(packet.amount);
            break;
          case 'REQ_PASS_BID':
            actionsRef.current.passBid();
            break;
          case 'REQ_PROPOSE_TRADE':
            if (packet.proposal) actionsRef.current.proposeTrade(packet.proposal);
            break;
          case 'REQ_ACCEPT_TRADE':
            actionsRef.current.acceptTrade();
            break;
          case 'REQ_DECLINE_TRADE':
            actionsRef.current.declineTrade();
            break;
          default:
            break;
        }
        await roomService.deleteRequest(roomId, reqId);
      });
    });
    return () => unsubscribe();
  }, [roomId, isHost, page]);

  // Actions wrapped to sync client inputs online
  const handleRollDice = () => {
    if (!roomId || isHost) {
      rollDice();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_ROLL_DICE', playerId: localPlayerId });
    }
  };

  const handleBuyProperty = () => {
    if (!roomId || isHost) {
      buyProperty();
    } else {
      const tileIdx = (pendingAction && 'tileIndex' in pendingAction) ? pendingAction.tileIndex : 0;
      roomService.pushRequest(roomId, { type: 'REQ_BUY_PROPERTY', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handleDeclineProperty = () => {
    if (!roomId || isHost) {
      declineProperty();
    } else {
      const tileIdx = (pendingAction && 'tileIndex' in pendingAction) ? pendingAction.tileIndex : 0;
      roomService.pushRequest(roomId, { type: 'REQ_DECLINE_PROPERTY', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handlePayRent = () => {
    if (!roomId || isHost) {
      payRent();
    } else {
      const tileIdx = (pendingAction && 'tileIndex' in pendingAction) ? pendingAction.tileIndex : 0;
      roomService.pushRequest(roomId, { type: 'REQ_PAY_RENT', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handlePayTax = () => {
    if (!roomId || isHost) {
      payTax();
    } else {
      const tileIdx = (pendingAction && 'tileIndex' in pendingAction) ? pendingAction.tileIndex : 0;
      roomService.pushRequest(roomId, { type: 'REQ_PAY_TAX', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handleConfirmCard = () => {
    if (!roomId || isHost) {
      confirmCardAction();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_CONFIRM_CARD', playerId: localPlayerId });
    }
  };

  const handleDeclareBankruptcy = () => {
    if (!roomId || isHost) {
      declareBankruptcy();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_DECLARE_BANKRUPTCY', playerId: localPlayerId });
    }
  };

  const handleBuildHouse = (tileIdx: number) => {
    if (!roomId || isHost) {
      buildHouse(tileIdx);
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_BUILD_HOUSE', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handleSellHouse = (tileIdx: number) => {
    if (!roomId || isHost) {
      sellHouse(tileIdx);
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_SELL_HOUSE', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handleMortgage = (tileIdx: number) => {
    if (!roomId || isHost) {
      mortgageProperty(tileIdx);
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_MORTGAGE', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handleUnmortgage = (tileIdx: number) => {
    if (!roomId || isHost) {
      unmortgageProperty(tileIdx);
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_UNMORTGAGE', playerId: localPlayerId, tileIndex: tileIdx });
    }
  };

  const handleEndTurn = () => {
    if (!roomId || isHost) {
      endTurn();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_END_TURN', playerId: localPlayerId });
    }
  };

  const handleBid = (amount: number) => {
    if (!roomId || isHost) {
      bidAuction(amount);
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_BID', playerId: localPlayerId, amount });
    }
  };

  const handlePassBid = () => {
    if (!roomId || isHost) {
      passBid();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_PASS_BID', playerId: localPlayerId });
    }
  };

  const handleProposeTrade = (proposal: TradeProposal) => {
    if (!roomId || isHost) {
      proposeTrade(proposal);
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_PROPOSE_TRADE', playerId: localPlayerId, proposal });
    }
  };

  const handleAcceptTrade = () => {
    if (!roomId || isHost) {
      acceptTrade();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_ACCEPT_TRADE', playerId: localPlayerId });
    }
  };

  const handleDeclineTrade = () => {
    if (!roomId || isHost) {
      declineTrade();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_DECLINE_TRADE', playerId: localPlayerId });
    }
  };

  // Trigger confetti when game ends
  useEffect(() => {
    if (gameState.status === 'ended' && gameState.winnerId) {
      const winner = gameState.players.find(p => p.id === gameState.winnerId);
      if (winner) {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
      }
    }
  }, [gameState.status, gameState.winnerId, gameState.players]);



  const handleOpenAssetManager = (player: Player) => {
    setManagingPlayer(player);
  };

  const handleCloseAssetManager = () => {
    setManagingPlayer(null);
  };

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  const renderCurrentPage = () => {
    if (page === 'home') return <Home />;
    if (page === 'create-room') return <CreateRoom />;
    if (page === 'join-room') return <JoinRoom />;
    if (page === 'lobby') return <Lobby />;
    return null;
  };

  const currentPageView = renderCurrentPage();

  if (currentPageView) {
    return currentPageView;
  }

  const winnerPlayer = gameState.winnerId
    ? gameState.players.find(p => p.id === gameState.winnerId)
    : null;

  return (
    <div className="h-screen h-[100dvh] bg-[#07080f] text-gray-200 flex flex-col relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <header className="h-10 md:h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md px-2 md:px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
          <span className="font-black text-sm md:text-lg tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-sans">
            TRADE EMPIRE
          </span>
          <span className="text-[8px] md:text-[10px] font-bold bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10 uppercase">
            Active
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-all cursor-pointer active:scale-90"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Leave match and return to home screen?')) {
                resetRoom();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold text-gray-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer active:scale-95 duration-100"
          >
            <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5" />
            Quit Room
          </button>
        </div>
      </header>

      <main className="flex-1 w-full grid grid-cols-1 md:grid-cols-[300px_1fr_320px] gap-1 md:gap-6 p-1 md:p-6 overflow-hidden max-w-[1600px] mx-auto no-scrollbar">
        
        {/* Player list sidebar - compact on mobile */}
        <div className="w-full md:w-[300px] flex flex-col gap-1 md:gap-4 shrink-0 overflow-visible md:overflow-y-auto no-scrollbar">
          <div className="p-0 md:p-4 md:border md:border-white/10 md:bg-white/2 md:glass-card md:rounded-[18px]">
            <PlayerList
              players={gameState.players}
              activePlayerIndex={gameState.activePlayerIndex}
              localPlayerId={localPlayerId}
              onManageAssets={handleOpenAssetManager}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-0 md:p-2 relative my-auto min-h-0 w-full">
          <GameBoard
            soundEnabled={soundEnabled}
            gameState={gameState}
            pendingAction={pendingAction}
            diceRolling={diceRolling}
            activePlayer={activePlayer}
            localPlayerId={localPlayerId}
            hostId={hostId}
            onRollDice={handleRollDice}
            onBuyProperty={handleBuyProperty}
            onDeclineProperty={handleDeclineProperty}
            onPayRent={handlePayRent}
            onPayTax={handlePayTax}
            onConfirmCard={handleConfirmCard}
            onDeclareBankruptcy={handleDeclareBankruptcy}
            onBuildHouse={handleBuildHouse}
            onSellHouse={handleSellHouse}
            onMortgage={handleMortgage}
            onUnmortgage={handleUnmortgage}
            onEndTurn={handleEndTurn}
            onBid={handleBid}
            onPassBid={handlePassBid}
            onProposeTrade={handleProposeTrade}
            onAcceptTrade={handleAcceptTrade}
            onDeclineTrade={handleDeclineTrade}
            onOpenAssetManager={handleOpenAssetManager}
            onCloseAssetManager={handleCloseAssetManager}
            managingPlayer={managingPlayer}
          />

          {gameState.status === 'ended' && winnerPlayer && (
            <VictoryModal
              winner={winnerPlayer}
              onPlayAgain={() => resetRoom()}
              onQuit={resetRoom}
            />
          )}

          {/* Bankruptcy Elimination Greetings Modal */}
          {(() => {
            const localPlayer = gameState.players.find(p => p.id === localPlayerId);
            if (localPlayer && localPlayer.isBankrupt && !dismissedBankruptcyModal && gameState.status !== 'ended') {
              return (
                <BankruptcyModal
                  player={localPlayer}
                  onSpectate={() => setDismissedBankruptcyModal(true)}
                  onQuit={resetRoom}
                />
              );
            }
            return null;
          })()}
        </div>

        {/* Right Sidebar (Chat + Logs) - Desktop/Tablet */}
        <div className="hidden md:flex w-[360px] flex-col gap-4 shrink-0 overflow-hidden no-scrollbar">
          <div className="flex flex-col h-full gap-4">
            
            {/* Tablet Tabs (hidden on desktop lg) */}
            <div className="lg:hidden flex border-b border-white/5 shrink-0 bg-slate-900/40 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveRightTab('chat')}
                className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-wider transition-all rounded-lg flex items-center justify-center gap-1.5 ${
                  activeRightTab === 'chat'
                    ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span>Chat</span>
                {tabletUnread && activeRightTab !== 'chat' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab('feeds')}
                className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${
                  activeRightTab === 'feeds'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Feeds
              </button>
            </div>

            {/* Chat Section (Visible on tablet if chat tab active, always visible on desktop lg) */}
            <div className={`flex-1 min-h-0 flex flex-col ${activeRightTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="hidden lg:flex items-center gap-2 mb-2 px-1 text-[10px] uppercase font-black tracking-widest text-gray-500 shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Live Room Chat</span>
              </div>
              <div className="flex-1 min-h-0">
                <ChatWindow roomId={gameState.roomId} activePlayer={activePlayer} players={gameState.players} />
              </div>
            </div>

            {/* Feeds Section (Visible on tablet if feeds tab active, always visible on desktop lg) */}
            <div className={`shrink-0 overflow-hidden flex flex-col ${
              activeRightTab === 'feeds' 
                ? 'flex flex-1 min-h-0' 
                : 'hidden lg:flex lg:h-56'
            }`}>
              <div className="hidden lg:flex items-center gap-2 mb-2 px-1 text-[10px] uppercase font-black tracking-widest text-gray-500 shrink-0">
                <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                <span>Game Feeds</span>
              </div>
              <div className="flex-1 min-h-0 bg-slate-950/20 border border-white/5 rounded-2xl p-3 overflow-hidden">
                <GameLogs logs={gameState.logs} />
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Bottom Action Bar for mobile (thumb-friendly layout) */}
      <div 
        className="md:hidden shrink-0 bg-[#0e101b]/95 border-t border-white/5 backdrop-blur-md flex items-center justify-around px-4 z-20 shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Trade Assets Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('TRIGGER_MOBILE_TRADE'));
          }}
          className="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Trade</span>
        </button>

        {/* Manage Assets Button */}
        <button
          onClick={() => {
            const localPlayer = gameState.players.find(p => p.id === localPlayerId);
            if (localPlayer) {
              handleOpenAssetManager(localPlayer);
            } else {
              alert("Lobby loading... Wait a moment!");
            }
          }}
          className="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-purple-400 transition-colors"
        >
          <Briefcase className="w-4 h-4 text-purple-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Assets</span>
        </button>

        {/* Game Logs (Feeds) Button */}
        <button
          onClick={() => setLogsOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-emerald-400 transition-colors relative"
        >
          <ListTodo className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Feeds</span>
        </button>
      </div>

      {/* Mobile Game Logs Bottom Sheet Drawer */}
      {logsOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end md:hidden animate-fade-in"
          onClick={() => setLogsOpen(false)}
        >
          <div 
            className="bg-[#131520] border-t border-white/10 rounded-t-3xl max-h-[60vh] flex flex-col p-4 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-3.5 cursor-pointer" onClick={() => setLogsOpen(false)} />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-gray-200">Game Feeds</span>
              </div>
              <button 
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                onClick={() => setLogsOpen(false)}
                title="Close Feeds"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 min-h-[220px]">
              <GameLogs logs={gameState.logs} />
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs md:max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto flex items-center gap-2.5 text-xs font-bold leading-snug ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : toast.type === 'chat'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-[#181a26]/95 border-white/10 text-gray-300'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'chat' ? 'bg-purple-400' : 'bg-gray-400'
              }`} />
              <span>{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
