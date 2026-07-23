import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const JoinRoom: React.FC = () => {
  const setPage = useGameStore((state) => state.setPage);
  const joinRoom = useGameStore((state) => state.joinRoom);

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;

    const success = joinRoom(roomCode, name);
    if (!success) {
      alert('Could not join room. Double check the code or room capacity.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-gray-200">
      
      {/* Background flourishes */}
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
          <div className="p-2.5 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-gray-200">
              Join Room
            </h1>
            <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mt-0.5">Join Friends Session</p>
          </div>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="flex flex-col gap-4 text-xs font-bold text-gray-300">
          
          <div>
            <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              maxLength={12}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase text-gray-500 mb-1.5 tracking-wider">Room Code</label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="e.g. ABCD12"
              maxLength={8}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 tracking-widest text-center uppercase font-black font-mono"
            />
          </div>

          <button
            type="submit"
            className="btn-supercell btn-supercell-cyan w-full py-4 text-xs font-black uppercase tracking-widest mt-4 shadow-lg active:scale-95 transition-all text-white"
          >
            Join Lobby
          </button>

        </form>

      </div>
    </div>
  );
};
export default JoinRoom;
