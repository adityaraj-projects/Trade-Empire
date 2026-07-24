import { useState, useEffect, useCallback } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { useGameStore } from './store/useGameStore';
import { Home } from './pages/Home';
import { CreateRoom } from './pages/CreateRoom';
import { JoinRoom } from './pages/JoinRoom';
import { Lobby } from './pages/Lobby';
import { GameBoard } from './components/GameBoard';
import { PlayerList } from './components/PlayerList';
import { Player, TradeProposal } from './types/game';
import { Sparkles, MessageSquare, Send, Award, Volume2, VolumeX, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { roomService } from './services/roomService';

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
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; color: string }[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync lobby players to game engine when launching the match
  useEffect(() => {
    if (page === 'game-board' && gameState.status === 'lobby') {
      initializeGame(
        lobbyPlayers.map((p) => ({
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
  useEffect(() => {
    if (!roomId || !isHost || page !== 'game-board') return;

    const unsubscribe = roomService.syncRequests(roomId, (requests) => {
      if (!requests) return;

      Object.entries(requests).forEach(async ([reqId, packet]) => {
        switch (packet.type) {
          case 'REQ_ROLL_DICE':
            rollDice();
            break;
          case 'REQ_BUY_PROPERTY':
            buyProperty();
            break;
          case 'REQ_DECLINE_PROPERTY':
            declineProperty();
            break;
          case 'REQ_PAY_RENT':
            payRent();
            break;
          case 'REQ_PAY_TAX':
            payTax();
            break;
          case 'REQ_END_TURN':
            endTurn();
            break;
          default:
            break;
        }
        await roomService.deleteRequest(roomId, reqId);
      });
    });
    return () => unsubscribe();
  }, [roomId, isHost, page, rollDice, buyProperty, declineProperty, payRent, payTax, endTurn]);

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

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    const playerColors: { [key: string]: string } = {
      purple: 'text-purple-400',
      cyan: 'text-cyan-400',
      red: 'text-red-400',
      blue: 'text-blue-400',
      green: 'text-emerald-400',
      yellow: 'text-yellow-400',
      pink: 'text-pink-400',
      orange: 'text-orange-400',
      emerald: 'text-emerald-400',
      amber: 'text-amber-400',
    };

    const colorClass = playerColors[activePlayer?.color || 'purple'] || 'text-purple-400';
    setChatMessages((prev) => [
      ...prev,
      { sender: activePlayer?.name || 'Player', text: chatInput.trim(), color: colorClass },
    ]);

    addLog(`${activePlayer?.name || 'Player'}: ${chatInput.trim()}`, 'chat', activePlayer?.name);
    setChatInput('');
  };

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
    <div className="min-h-screen bg-[#07080f] text-gray-200 flex flex-col relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-black text-lg tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-sans">
            TRADE EMPIRE
          </span>
          <span className="text-[10px] font-bold bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg border border-white/10 uppercase">
            Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-all cursor-pointer active:scale-90"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Leave match and return to home screen?')) {
                resetRoom();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer active:scale-95 duration-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Quit Room
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-y-auto md:overflow-hidden max-w-7xl mx-auto w-full no-scrollbar">
        
        <div className="w-full md:w-80 flex flex-col gap-5 shrink-0 overflow-visible md:overflow-y-auto no-scrollbar">
          <div className="glass-card p-4 border border-white/10 bg-white/2">
            <PlayerList
              players={gameState.players}
              activePlayerIndex={gameState.activePlayerIndex}
              onManageAssets={handleOpenAssetManager}
            />
          </div>

          <div className="hidden md:flex glass-card p-4 border border-white/10 bg-white/2 flex-1 flex flex-col min-h-[14rem] max-h-[18rem] md:max-h-none justify-between">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">Room Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1 text-xs no-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 my-auto">Say hello to other players!</div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="leading-relaxed break-all bg-white/2 p-2 rounded-lg border border-white/3">
                    <span className={`font-bold mr-1.5 ${msg.color}`}>{msg.sender}:</span>
                    <span className="text-gray-300">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-bold"
              />
              <button
                onClick={handleSendChat}
                className="btn-supercell btn-supercell-purple p-3 rounded-xl flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 relative">
          <GameBoard
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

      </main>

    </div>
  );
}
