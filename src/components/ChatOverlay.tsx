import React, { useState } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { Player, GameLog } from '../types/game';
import { roomService } from '../services/roomService';

interface ChatOverlayProps {
  roomId: string;
  activePlayer: Player;
  logs: GameLog[];
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ roomId, activePlayer, logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  // Extract only chat messages from logs
  const chatMessages = (logs || []).filter(l => l && l.type === 'chat');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !roomId) return;

    const newMessage: GameLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `${activePlayer.name}: ${text.trim()}`,
      type: 'chat',
      playerName: activePlayer.name,
    };

    // Append to logs array
    const updatedLogs = [newMessage, ...logs].slice(0, 100);
    await roomService.updateState(roomId, { logs: updatedLogs });
    setText('');
  };

  return (
    <>
      {/* Floating Chat Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer z-40 flex items-center justify-center border border-purple-400/20"
        title="Open Chat"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-slate-950/95 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-2xl backdrop-blur z-50 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-purple-400" />
              <span className="font-bold text-sm tracking-wide text-gray-200">Room Chat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col-reverse gap-2 no-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  No chat messages yet.
                </span>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isSelf = msg.playerName === activePlayer.name;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] rounded-2xl px-3 py-2 text-xs text-gray-200 border ${
                      isSelf
                        ? 'self-end bg-purple-600/10 border-purple-500/20 rounded-tr-none'
                        : 'self-start bg-cyan-600/10 border-cyan-500/20 rounded-tl-none'
                    }`}
                  >
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5 tracking-wider">
                      {msg.playerName} • {msg.timestamp}
                    </span>
                    <p className="leading-relaxed font-semibold break-all">
                      {msg.message.replace(`${msg.playerName}: `, '')}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex gap-2 border-t border-white/5 pt-3 mt-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-medium"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
