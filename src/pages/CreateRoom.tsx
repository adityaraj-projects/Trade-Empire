import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const CreateRoom: React.FC = () => {
  const setPage = useGameStore((state) => state.setPage);
  const createRoom = useGameStore((state) => state.createRoom);

  const [name, setName] = useState('Addi');
  const [startingMoney, setStartingMoney] = useState(15000);
  const [salary, setSalary] = useState(2000);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [turnTimer, setTurnTimer] = useState(60);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createRoom(name, {
      startingMoney,
      salary,
      maxPlayers,
      jailFine: 500,
      turnTimeLimit: turnTimer,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-gray-200">
      
      {/* Decorative floating shapes */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none float-animation"></div>
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none float-animation-delayed"></div>

      <div className="w-full max-w-md glass-card p-6 md:p-8 shadow-2xl relative border border-white/10 bg-white/2 backdrop-blur-md">
        
        {/* Back Button */}
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-white transition-all mb-6 cursor-pointer active:scale-95 duration-100 uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Title */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-2.5 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-gray-200">
              Create Room
            </h1>
            <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mt-0.5">Game Parameters Setup</p>
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs font-bold text-gray-300">
          
          <div>
            <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Host Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Starting Cash</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500 font-black">₹</span>
                <input
                  type="number"
                  required
                  value={startingMoney}
                  onChange={(e) => setStartingMoney(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-black font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Salary (GO)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500 font-black">₹</span>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={(e) => setSalary(Math.max(100, Number(e.target.value)))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-black font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Max Bidders</label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-bold"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n} className="bg-slate-900">{n} Players</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Turn Limit</label>
              <select
                value={turnTimer}
                onChange={(e) => setTurnTimer(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
                <option value={90}>90 Seconds</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-supercell btn-supercell-purple w-full py-4 text-xs font-black uppercase tracking-widest mt-4 shadow-lg active:scale-95 transition-all text-white"
          >
            Launch Lobby
          </button>
        </form>

      </div>
    </div>
  );
};
export default CreateRoom;
