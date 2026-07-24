import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Player } from '../types/game';
import { roomService } from '../services/roomService';
import { ChatWindow } from './ChatWindow';

interface ChatOverlayProps {
  roomId: string;
  activePlayer: Player;
  players: Player[];
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ roomId, activePlayer, players }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync messages to compute unread badge
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = roomService.syncChatMessages(roomId, (syncedMessages) => {
      const msgs = syncedMessages || [];
      setMessages(msgs);
      // For initial sync, initialize prevRef without counting
      if (!initialSyncDoneRef.current) {
        prevCountRef.current = msgs.length;
        initialSyncDoneRef.current = true;
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  const prevCountRef = useRef(0);
  const initialSyncDoneRef = useRef(false);
  const prevOwnCountRef = useRef(0);

  // Handle unread count increment — only count messages from others
  useEffect(() => {
    const nonOwnMessages = messages.filter(m => m.senderId !== activePlayer?.id && m.playerName !== activePlayer?.name);
    const currentNonOwn = nonOwnMessages.length;

    if (currentNonOwn > prevOwnCountRef.current) {
      if (!isOpen) {
        setUnreadCount((c) => c + (currentNonOwn - prevOwnCountRef.current));
      }
    }
    prevOwnCountRef.current = currentNonOwn;
  }, [messages, isOpen, activePlayer?.id]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Trigger button (Mobile Only) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed right-4 p-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer z-40 flex items-center justify-center border border-purple-400/20"
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
        title="Open Chat"
      >
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 border-2 border-[#131520] rounded-full flex items-center justify-center text-[9px] font-black text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Bottom Sheet Drawer (Mobile Only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end md:hidden animate-fade-in animate-duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-[#131520] border-t border-white/10 rounded-t-3xl h-[75vh] flex flex-col p-4 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-3.5 cursor-pointer" onClick={() => setIsOpen(false)} />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-purple-400" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-gray-200">Room Chat</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 min-h-0">
              <ChatWindow 
                roomId={roomId} 
                activePlayer={activePlayer} 
                players={players} 
                isMobileDrawer={true} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
