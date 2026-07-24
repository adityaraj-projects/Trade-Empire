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
import { Sparkles, MessageSquare, Send, Award, Volume2, VolumeX, LogOut, Briefcase, ListTodo } from 'lucide-react';
import confetti from 'canvas-confetti';
import { roomService } from './services/roomService';
import { GameLogs } from './components/GameLogs';
import { ChatWindow } from './components/ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
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
    if (prevLogsLengthRef.current > 0 && logs.length > prevLogsLengthRef.current) {
      const addedLogs = logs.slice(prevLogsLengthRef.current);
      addedLogs.forEach((log) => {
        let type: 'info' | 'chat' | 'success' = 'info';
        const msg = log.message.toLowerCase();
        if (msg.includes('won') || msg.includes('bought') || msg.includes('build') || msg.includes('monopoly')) {
          type = 'success';
        }
        addToast(log.message, type);
      });
    }
    prevLogsLengthRef.current = logs.length;
  }, [gameState.logs, addToast]);

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
  const actionsRef = useRef({ rollDice, buyProperty, declineProperty, payRent, payTax, endTurn });
  useEffect(() => {
    actionsRef.current = { rollDice, buyProperty, declineProperty, payRent, payTax, endTurn };
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
          case 'REQ_END_TURN':
            actionsRef.current.endTurn();
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

  const handleEndTurn = () => {
    if (!roomId || isHost) {
      endTurn();
    } else {
      roomService.pushRequest(roomId, { type: 'REQ_END_TURN', playerId: localPlayerId });
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

  if (page === 'home') return <Home />;
  if (page === 'create-room') return <CreateRoom />;
  if (page === 'join-room') return <JoinRoom />;
  if (page === 'lobby') return <Lobby />;

  const winnerPlayer = gameState.winnerId
    ? gameState.players.find(p => p.id === gameState.winnerId)
    : null;

  return (
    <div className="h-screen h-[100dvh] bg-[#07080f] text-gray-200 flex flex-col relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <header className="h-12 md:h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md px-3 md:px-6 flex items-center justify-between shrink-0 z-10">
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

      <main className="flex-1 w-full grid grid-cols-1 md:grid-cols-[320px_1fr_340px] gap-6 p-2 md:p-6 overflow-hidden max-w-[1600px] mx-auto no-scrollbar">
        
        <div className="w-full md:w-[320px] flex flex-col gap-4 shrink-0 overflow-visible md:overflow-y-auto no-scrollbar">
          <div className="p-1 md:p-4 md:border md:border-white/10 md:bg-white/2 md:glass-card md:rounded-[18px]">
            <PlayerList
              players={gameState.players}
              activePlayerIndex={gameState.activePlayerIndex}
              onManageAssets={handleOpenAssetManager}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-0.5 md:p-2 relative">
          <GameBoard
            soundEnabled={soundEnabled}
            gameState={gameState}
            pendingAction={pendingAction}
            diceRolling={diceRolling}
            activePlayer={activePlayer}
            localPlayerId={localPlayerId}
            onRollDice={handleRollDice}
            onBuyProperty={handleBuyProperty}
            onDeclineProperty={handleDeclineProperty}
            onPayRent={handlePayRent}
            onPayTax={handlePayTax}
            onConfirmCard={confirmCardAction}
            onDeclareBankruptcy={declareBankruptcy}
            onBuildHouse={buildHouse}
            onSellHouse={sellHouse}
            onMortgage={mortgageProperty}
            onUnmortgage={unmortgageProperty}
            onEndTurn={handleEndTurn}
            onBid={bidAuction}
            onPassBid={passBid}
            onProposeTrade={proposeTrade}
            onAcceptTrade={acceptTrade}
            onDeclineTrade={declineTrade}
            onOpenAssetManager={handleOpenAssetManager}
            onCloseAssetManager={handleCloseAssetManager}
            managingPlayer={managingPlayer}
          />

          {gameState.status === 'ended' && winnerPlayer && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 z-40 animate-fade-in">
              <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(234,179,8,0.2)] animate-pulse">
                <Award className="w-9 h-9" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                VICTORY ROYALE!
              </h2>
              <p className="text-sm text-gray-300 mt-2 max-w-[20rem]">
                <span className="font-bold text-yellow-400">{winnerPlayer.name}</span> has bankrupted all other players and conquered the trade empire!
              </p>
              
              <div className="mt-6 flex flex-col gap-2 items-center text-xs text-gray-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Match Stats</span>
                <div className="flex gap-4 bg-white/3 border border-white/5 px-4 py-2.5 rounded-xl">
                  <div>
                    <span className="block font-black text-gray-200">₹{winnerPlayer.money.toLocaleString()}</span>
                    <span>Winner Cash</span>
                  </div>
                  <div className="border-l border-white/5 pl-4">
                    <span className="block font-black text-gray-200">{(winnerPlayer.properties || []).length}</span>
                    <span>Properties Owned</span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetRoom}
                className="mt-8 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all"
              >
                Back to Home Screen
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar (Chat + Logs) - Desktop Only */}
        <div className="hidden md:flex w-[340px] flex-col gap-4 shrink-0 overflow-hidden no-scrollbar">
          <div className="flex flex-col h-full gap-4">
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-1 text-[10px] uppercase font-black tracking-widest text-gray-500 shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Live Room Chat</span>
              </div>
              <div className="flex-1 min-h-0">
                <ChatWindow roomId={gameState.roomId} activePlayer={activePlayer} players={gameState.players} />
              </div>
            </div>

            <div className="h-56 shrink-0 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-1 text-[10px] uppercase font-black tracking-widest text-gray-500 shrink-0">
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
      <div className="md:hidden h-14 shrink-0 bg-[#0e101b]/95 border-t border-white/5 backdrop-blur-md flex items-center justify-around px-4 z-20 shadow-2xl safe-bottom">
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
                className="text-[10px] uppercase font-black tracking-wider text-gray-400 hover:text-white px-2 py-1 bg-white/5 border border-white/5 rounded-lg"
                onClick={() => setLogsOpen(false)}
              >
                Close
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
