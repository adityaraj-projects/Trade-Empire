import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Copy, Check, Users, Shield, Crown, Play, X, UserPlus, LogOut } from 'lucide-react';
import { PLAYER_COLOR_MAP } from '../components/PlayerList';
import { PlayerColor } from '../types/game';
import { ChatOverlay } from '../components/ChatOverlay';

const AVAILABLE_COLORS: PlayerColor[] = [
  'purple', 'cyan', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'emerald', 'amber'
];

export const Lobby: React.FC = () => {
  const roomId = useGameStore((state) => state.roomId);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const hostId = useGameStore((state) => state.hostId);
  const players = useGameStore((state) => state.players);
  const settings = useGameStore((state) => state.settings);
  const addLobbyPlayer = useGameStore((state) => state.addLobbyPlayer);
  const kickPlayer = useGameStore((state) => state.kickPlayer);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const resetRoom = useGameStore((state) => state.resetRoom);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const logs = useGameStore((state) => state.logs);

  const localPlayer = players.find(p => p.id === localPlayerId);
  const [copied, setCopied] = useState(false);
  
  // Local simulated player builder
  const [simName, setSimName] = useState('');
  const [simColor, setSimColor] = useState<PlayerColor>('purple');

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSimPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;
    if (players.length >= settings.maxPlayers) return;

    addLobbyPlayer(simName.trim(), simColor);
    setSimName('');
    
    const unusedColor = AVAILABLE_COLORS.find(c => !players.some(p => p.color === c) && c !== simColor);
    if (unusedColor) setSimColor(unusedColor);
  };

  const isHost = localPlayerId === hostId;
  const unusedColors = AVAILABLE_COLORS.filter(c => !players.some(p => p.color === c));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden text-gray-200">
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="h-16 flex items-center justify-between px-4 max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]" />
          <span className="font-black text-sm tracking-wider text-purple-300 font-sans">WAITING LOBBY</span>
        </div>
        <button
          onClick={resetRoom}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/3 border border-white/10 text-xs font-bold text-gray-300 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer active:scale-95 duration-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          Leave Lobby
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full z-10 py-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 p-4 items-start">
          
          {/* Left panel: Room Code & Player List (takes 7 cols on desktop) */}
          <div className="glass-card md:col-span-7 p-6 border border-white/10 flex flex-col gap-5 justify-between bg-white/2 shadow-2xl backdrop-blur-md min-h-[460px]">
            <div>
              {/* Room ID banner */}
              <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Room Code</span>
              <div className="flex items-center justify-between bg-black/45 border border-white/10 px-5 py-3 rounded-2xl mt-1.5 mb-5 shadow-inner">
                <span className="text-2xl font-black tracking-widest text-cyan-400 font-mono select-all">{roomId}</span>
                <button
                  onClick={copyCode}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-90"
                  title="Copy Room Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Connected players lists */}
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-300">
                  Joined Players ({players.length}/{settings.maxPlayers})
                </h2>
              </div>

              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 no-scrollbar border border-white/5 rounded-2xl p-2.5 bg-black/15">
                {players.map((p) => {
                  const pIsHost = p.id === hostId;
                  const isSelf = p.id === localPlayerId;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isSelf ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 bg-white/2'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-2xl bg-slate-800 flex items-center justify-center text-lg border border-white/15 shadow">
                            {p.avatar}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-gray-200">{p.name}</span>
                            {isSelf && (
                              <span className="text-[7.5px] px-1.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-black tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[9px] font-black uppercase tracking-widest mt-0.5 block"
                            style={{ color: PLAYER_COLOR_MAP[p.color] }}
                          >
                            {p.color} team
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {pIsHost ? (
                          <span className="flex items-center gap-1 text-[7.5px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                            <Shield className="w-3 h-3" /> Host
                          </span>
                        ) : (
                          isHost && (
                            <button
                              onClick={() => kickPlayer(p.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/0 hover:border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                              title="Kick player"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Trigger */}
            <div className="mt-5 border-t border-white/5 pt-4">
              {isHost ? (
                <button
                  onClick={startNewGame}
                  disabled={players.length < 2}
                  className={`btn-supercell w-full py-4 text-xs font-black uppercase tracking-widest transition-all ${
                    players.length >= 2
                      ? 'btn-supercell-purple'
                      : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Play className="w-4 h-4 fill-white inline-block mr-2 -mt-0.5" />
                  START GAME
                </button>
              ) : (
                <div className="text-center py-4 px-4 rounded-2xl bg-white/2 border border-white/5 text-xs text-gray-400 font-extrabold uppercase animate-pulse tracking-widest">
                  Waiting for Host to launch game...
                </div>
              )}
              {isHost && players.length < 2 && (
                <span className="text-[9px] text-yellow-400/80 font-bold block text-center mt-3 uppercase tracking-wider">
                  Need at least 2 players in lobby to start.
                </span>
              )}
            </div>
          </div>

          {/* Right panel: Simulation Tool & Rules Configuration (takes 5 cols on desktop) */}
          <div className="flex flex-col gap-6 md:col-span-5">
            {/* 1. Simulate Players Builder */}
            <div className="glass-card p-6 border border-white/10 bg-white/2 shadow-2xl">
              <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Simulate Players (Local Play)</span>
              
              <form onSubmit={handleAddSimPlayer} className="mt-4 flex flex-col gap-3.5">
                <div>
                  <label className="text-[9px] uppercase block text-gray-500 mb-1.5 font-bold tracking-wider">Guest Name</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="e.g. Rohit, Aman..."
                    maxLength={10}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5 items-end">
                  <div>
                    <label className="text-[9px] uppercase block text-gray-500 mb-1.5 font-bold tracking-wider">Team Color</label>
                    <select
                      value={simColor}
                      onChange={(e) => setSimColor(e.target.value as PlayerColor)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 capitalize font-bold"
                    >
                      {unusedColors.map(c => (
                        <option key={c} value={c} className="bg-slate-900 text-gray-200 capitalize font-semibold">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={players.length >= settings.maxPlayers || !simName.trim()}
                    className="btn-supercell btn-supercell-cyan py-2.5 text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Guest
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Room Rules Board */}
            <div className="glass-card p-6 border border-white/10 bg-white/2 shadow-2xl text-xs leading-relaxed text-gray-400">
              <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider block mb-4">Lobby Parameters</span>
              
              {isHost ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-gray-300 font-bold mb-1.5">
                      <span>Starting Cash:</span>
                      <span className="text-purple-400 font-mono font-black">₹{settings.startingMoney.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={30000}
                      step={1000}
                      value={settings.startingMoney}
                      onChange={(e) => updateSettings({ startingMoney: Number(e.target.value) })}
                      className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-300 font-bold mb-1.5">
                      <span>GO Passed Salary:</span>
                      <span className="text-purple-400 font-mono font-black">₹{settings.salary.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={4000}
                      step={500}
                      value={settings.salary}
                      onChange={(e) => updateSettings({ salary: Number(e.target.value) })}
                      className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-300 font-bold mb-1.5">
                      <span>Jail Release Fine:</span>
                      <span className="text-purple-400 font-mono font-black">₹{settings.jailFine.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={1500}
                      step={100}
                      value={settings.jailFine}
                      onChange={(e) => updateSettings({ jailFine: Number(e.target.value) })}
                      className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-300 font-bold mb-1.5">
                      <span>Turn Time Limit:</span>
                      <span className="text-purple-400 font-mono font-black">
                        {settings.turnTimeLimit > 0 ? `${settings.turnTimeLimit}s` : 'Unlimited'}
                      </span>
                    </div>
                    <select
                      value={settings.turnTimeLimit}
                      onChange={(e) => updateSettings({ turnTimeLimit: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 font-bold"
                    >
                      <option value={30}>30 Seconds</option>
                      <option value={60}>60 Seconds</option>
                      <option value={90}>90 Seconds</option>
                      <option value={0}>Unlimited</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 font-semibold">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>Starting Cash:</span>
                    <span className="text-gray-200 font-black">₹{settings.startingMoney.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>GO Passed Salary:</span>
                    <span className="text-gray-200 font-black">₹{settings.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>Jail Release Fine:</span>
                    <span className="text-gray-200 font-black">₹{settings.jailFine.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Turn Limit Timer:</span>
                    <span className="text-gray-200 font-black">
                      {settings.turnTimeLimit > 0 ? `${settings.turnTimeLimit} sec` : 'Infinite'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-8"></div>

      {localPlayer && (
        <ChatOverlay roomId={roomId} activePlayer={localPlayer} logs={logs} />
      )}
    </div>
  );
};
export default Lobby;
