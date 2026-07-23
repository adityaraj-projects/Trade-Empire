import React, { useState } from 'react';
import { PlayerColor, GameSettings } from '../types/game';
import { User, DollarSign, Trophy, ShieldAlert, Sparkles } from 'lucide-react';

interface LobbyProps {
  onStartGame: (players: { name: string; color: PlayerColor }[]) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

const AVAILABLE_COLORS: PlayerColor[] = [
  'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'cyan', 'orange', 'emerald', 'amber'
];

export const Lobby: React.FC<LobbyProps> = ({ onStartGame, settings, onUpdateSettings }) => {
  const [players, setPlayers] = useState<{ name: string; color: PlayerColor }[]>([
    { name: 'Addi (Host)', color: 'purple' },
    { name: 'Rahul', color: 'cyan' },
  ]);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerColor, setNewPlayerColor] = useState<PlayerColor>('red');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (players.length >= settings.maxPlayers) return;

    setPlayers([...players, { name: newPlayerName.trim(), color: newPlayerColor }]);
    setNewPlayerName('');
    
    // Choose next available color as default
    const unusedColor = AVAILABLE_COLORS.find(c => !players.some(p => p.color === c) && c !== newPlayerColor);
    if (unusedColor) setNewPlayerColor(unusedColor);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, idx) => idx !== index));
  };

  const handleStart = () => {
    if (players.length < 2) return;
    onStartGame(players);
  };

  const unusedColors = AVAILABLE_COLORS.filter(c => !players.some(p => p.color === c));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0b10] text-gray-200">
      <div className="w-full max-w-4xl glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden custom-glow">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Side: Game Setup & Players */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                VYAPARX
              </h1>
              <p className="text-sm text-gray-400 font-medium">Bharat Business Royale</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-300">
              <User className="w-5 h-5 text-purple-400" />
              Lobby Players ({players.length}/{settings.maxPlayers})
            </h2>

            {/* Players list */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              {players.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-${p.color}-500 shadow-[0_0_8px_rgba(255,255,255,0.2)]`} 
                         style={{ backgroundColor: p.color === 'purple' ? '#a855f7' : p.color === 'cyan' ? '#06b6d4' : p.color === 'red' ? '#ef4444' : p.color === 'blue' ? '#3b82f6' : p.color === 'green' ? '#22c55e' : p.color === 'yellow' ? '#eab308' : p.color === 'pink' ? '#ec4899' : p.color === 'orange' ? '#f97316' : p.color === 'emerald' ? '#10b981' : '#f59e0b' }}>
                    </div>
                    <span className="font-semibold text-gray-200">{p.name}</span>
                  </div>
                  {players.length > 2 && (
                    <button
                      onClick={() => removePlayer(idx)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all border border-rose-500/0 hover:border-rose-500/20"
                    >
                      Kick
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Player Box */}
            {players.length < settings.maxPlayers && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2 p-3 bg-white/3 rounded-xl border border-white/5">
                <input
                  type="text"
                  placeholder="Player Name..."
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  maxLength={15}
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newPlayerColor}
                    onChange={(e) => setNewPlayerColor(e.target.value as PlayerColor)}
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 capitalize"
                  >
                    {unusedColors.map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-gray-200 capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addPlayer}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:shadow-[0_0_16px_rgba(168,85,247,0.5)]"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Host Rules Configuration */}
        <div className="w-full md:w-80 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 justify-between">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-300">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              Game Settings
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Starting Cash</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={settings.startingMoney}
                    onChange={(e) => onUpdateSettings({ startingMoney: Math.max(1000, Number(e.target.value)) })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Pass Salary (GO)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={settings.salary}
                    onChange={(e) => onUpdateSettings({ salary: Math.max(100, Number(e.target.value)) })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Jail Release Fine</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={settings.jailFine}
                    onChange={(e) => onUpdateSettings({ jailFine: Math.max(50, Number(e.target.value)) })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Max Lobby Players</label>
                <select
                  value={settings.maxPlayers}
                  onChange={(e) => onUpdateSettings({ maxPlayers: Number(e.target.value) })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n} className="bg-slate-900 text-gray-200">{n} Players</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={players.length < 2}
            className={`w-full mt-6 py-3.5 rounded-xl font-bold tracking-wider text-white transition-all duration-300 ${
              players.length >= 2
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transform hover:scale-[1.02]'
                : 'bg-white/10 border border-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            LAUNCH GAME
          </button>
        </div>

      </div>
    </div>
  );
};
