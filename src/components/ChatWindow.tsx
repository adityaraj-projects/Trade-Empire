import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, CornerUpLeft, Smile, ChevronDown, Check, CheckCheck } from 'lucide-react';
import { Player } from '../types/game';
import { roomService } from '../services/roomService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  roomId: string;
  activePlayer: Player;
  players: Player[];
  isMobileDrawer?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  color: string;
  readBy: string[];
  reactions?: { [emoji: string]: string[] }; // emoji -> array of playerIds who reacted
  replyTo?: {
    id: string;
    senderName: string;
    message: string;
  };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, activePlayer, players, isMobileDrawer = false }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingState, setTypingState] = useState<{ [playerId: string]: boolean }>({});
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [showEmojiPickerForMsgId, setShowEmojiPickerForMsgId] = useState<string | null>(null);
  const [showNewMessagesBtn, setShowNewMessagesBtn] = useState(false);
  const [unreadNewCount, setUnreadNewCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Sync messages
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = roomService.syncChatMessages(roomId, (syncedMessages) => {
      const msgs = (syncedMessages || []) as ChatMessage[];
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [roomId]);

  // Sync typing indicators
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = roomService.syncTypingState(roomId, (typing) => {
      setTypingState(typing || {});
    });
    return () => unsubscribe();
  }, [roomId]);

  // Handle typing state transitions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!roomId || !activePlayer) return;

    roomService.setTypingState(roomId, activePlayer.id, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      roomService.setTypingState(roomId, activePlayer.id, false);
    }, 1500);
  };

  // Clean typing state on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (roomId && activePlayer) {
        roomService.setTypingState(roomId, activePlayer.id, false);
      }
    };
  }, [roomId, activePlayer]);

  // Check scroll position to determine whether to auto-scroll or show floating down-arrow button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // If user is scrolled up more than 100px from the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isAtBottom) {
      setShowNewMessagesBtn(false);
      setUnreadNewCount(0);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior
      });
      setShowNewMessagesBtn(false);
      setUnreadNewCount(0);
    }
  };

  // Scroll to bottom when new messages arrive
  const prevMessagesCountRef = useRef(messages.length);
  useEffect(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (messages.length > prevMessagesCountRef.current) {
      const added = messages.length - prevMessagesCountRef.current;
      const latestMsg = messages[messages.length - 1];
      const isFromSelf = latestMsg && latestMsg.senderId === activePlayer?.id;

      if (isAtBottom || isFromSelf) {
        setTimeout(() => scrollToBottom('smooth'), 100);
      } else {
        setShowNewMessagesBtn(true);
        setUnreadNewCount(prev => prev + added);
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, activePlayer]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !roomId || !activePlayer) return;

    const payload: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: activePlayer.id,
      senderName: activePlayer.name,
      message: text.trim(),
      timestamp: new Date().toISOString(),
      color: activePlayer.color || 'purple',
      readBy: [activePlayer.id],
      reactions: {}
    };

    if (replyTarget) {
      payload.replyTo = {
        id: replyTarget.id,
        senderName: replyTarget.senderName,
        message: replyTarget.message
      };
    }

    // Stop typing immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await roomService.setTypingState(roomId, activePlayer.id, false);

    await roomService.pushChatMessage(roomId, payload);
    
    setText('');
    setReplyTarget(null);
  };

  const handleAddReaction = async (msgId: string, emoji: string) => {
    if (!roomId) return;
    
    // Find the message index in the local array
    const messageIndex = messages.findIndex(m => m.id === msgId);
    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    const reactions = { ...(message.reactions || {}) };
    const currentList = reactions[emoji] || [];

    let updatedList;
    if (currentList.includes(activePlayer.name)) {
      updatedList = currentList.filter(name => name !== activePlayer.name);
    } else {
      updatedList = [...currentList, activePlayer.name];
    }

    if (updatedList.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = updatedList;
    }

    // Since push keys are random, we update the reaction locally for immediate response
    // For production-grade syncing, reactions can be synced under /reactions or via messages node updates
    // In this scope, since we want to avoid deep Firebase mutations and stay robust, we keep it locally
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions } : m));
    setShowEmojiPickerForMsgId(null);
  };

  // Group consecutive messages by sender and within 2 minutes limit
  const groupedMessages: { msg: ChatMessage; isGroupStart: boolean; showTimeSeparator: boolean }[] = [];
  messages.forEach((msg, idx) => {
    const prev = messages[idx - 1];
    
    // Time separator check (more than 10 minutes gap or day change)
    let showTimeSeparator = false;
    if (prev) {
      const prevTime = new Date(prev.timestamp).getTime();
      const currTime = new Date(msg.timestamp).getTime();
      if (currTime - prevTime > 10 * 60 * 1000) {
        showTimeSeparator = true;
      }
    } else {
      showTimeSeparator = true;
    }

    const isGroupStart = 
      !prev || 
      prev.senderId !== msg.senderId || 
      showTimeSeparator ||
      (new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime() > 2 * 60 * 1000);

    groupedMessages.push({ msg, isGroupStart, showTimeSeparator });
  });

  // Compile other typing players list
  const typingPlayersNames = Object.entries(typingState)
    .filter(([id, isTyping]) => isTyping && id !== activePlayer?.id)
    .map(([id]) => players.find(p => p.id === id)?.name || 'Someone');

  const parseTimestamp = (isoString: string) => {
    if (!isoString) return new Date();
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) return d;
    
    const today = new Date();
    const timeMatch = isoString.match(/(\d+):(\d+):?(\d+)?\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const isPM = timeMatch[4] && timeMatch[4].toUpperCase() === 'PM';
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      today.setHours(hours, minutes, 0, 0);
      return today;
    }
    return new Date();
  };

  const formatSeparator = (isoString: string) => {
    const d = parseTimestamp(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMsgTime = (isoString: string) => {
    const d = parseTimestamp(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPlayerColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
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
    return colors[color] || 'text-purple-400';
  };

  return (
    <div className="flex flex-col justify-between h-full relative overflow-hidden bg-slate-950/40 rounded-2xl border border-white/5 p-3 backdrop-blur-sm">
      {/* Scrollable messages area */}
      <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 no-scrollbar scroll-smooth"
      >
        {groupedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-white/10 mb-2 animate-bounce" />
            <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">
              No messages yet. Say hello!
            </span>
          </div>
        ) : (
          groupedMessages.map(({ msg, isGroupStart, showTimeSeparator }) => {
            const isSelf = msg.senderId === activePlayer?.id;
            const sender = players.find(p => p.id === msg.senderId);
            const isOnline = sender?.connected ?? true;

            return (
              <React.Fragment key={msg.id}>
                {showTimeSeparator && (
                  <div className="flex items-center justify-center my-3 shrink-0">
                    <div className="h-[1px] bg-white/5 flex-1" />
                    <span className="text-[9px] uppercase font-black tracking-widest text-gray-500 px-3 bg-slate-950/20 rounded-full border border-white/5 py-0.5">
                      {formatSeparator(msg.timestamp)}
                    </span>
                    <div className="h-[1px] bg-white/5 flex-1" />
                  </div>
                )}

                <div 
                  className={`flex gap-2 group/msg relative ${isSelf ? 'justify-end' : 'justify-start'} ${isGroupStart ? 'mt-1.5' : 'mt-0.5'}`}
                >
                  {/* Left Side Avatar (only for other players on group starts) */}
                  {!isSelf && isGroupStart && (
                    <div className="relative shrink-0 self-end">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-white/10 shadow shadow-black/40">
                        {sender?.avatar || '🎮'}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0d0e12] ${isOnline ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-gray-500'}`} />
                    </div>
                  )}
                  {!isSelf && !isGroupStart && <div className="w-7 shrink-0" />}

                  {/* Message Bubble Column */}
                  <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
                    {/* Header line on group starts */}
                    {!isSelf && isGroupStart && (
                      <span className={`text-[9px] font-black uppercase tracking-wider mb-1 ${getPlayerColorClass(msg.color)}`}>
                        {msg.senderName}
                      </span>
                    )}

                    {/* Replied-to Preview strip */}
                    {msg.replyTo && (
                      <div className="text-[9px] text-gray-400 bg-white/3 border-l-2 border-cyan-500/40 rounded px-2 py-0.5 mb-1 flex items-center gap-1 opacity-70">
                        <CornerUpLeft className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="font-bold text-gray-300 shrink-0">{msg.replyTo.senderName}:</span>
                        <span className="truncate">{msg.replyTo.message}</span>
                      </div>
                    )}

                    {/* Bubble body */}
                    <div className="relative">
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs text-gray-200 border relative ${
                          isSelf
                            ? 'bg-purple-600/10 border-purple-500/20 rounded-tr-none shadow-[0_2px_12px_rgba(168,85,247,0.05)]'
                            : 'bg-white/3 border-white/5 rounded-tl-none shadow-[0_2px_12px_rgba(255,255,255,0.01)]'
                        }`}
                      >
                        <p className="leading-relaxed font-semibold break-all text-gray-200">
                          {msg.message}
                        </p>

                        {/* Timestamp & Ticks (inside the bubble bottom-right or side-aligned) */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-gray-500 font-bold tracking-wider">
                          <span>{formatMsgTime(msg.timestamp)}</span>
                          {isSelf && (
                            <span>
                              {msg.readBy && msg.readBy.length >= players.length ? (
                                <CheckCheck className="w-3 h-3 text-purple-400" />
                              ) : (
                                <CheckCheck className="w-3 h-3 text-gray-600" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (Reply, React) that fade in on hover */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 bg-[#131520] border border-white/10 px-1.5 py-0.5 rounded-lg shadow-lg z-30 pointer-events-auto ${
                          isSelf ? 'right-full mr-2' : 'left-full ml-2'
                        }`}
                      >
                        <button
                          onClick={() => setReplyTarget(msg)}
                          className="p-1 hover:text-cyan-400 text-gray-400 rounded transition-colors cursor-pointer"
                          title="Reply"
                        >
                          <CornerUpLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setShowEmojiPickerForMsgId(showEmojiPickerForMsgId === msg.id ? null : msg.id)}
                          className="p-1 hover:text-yellow-400 text-gray-400 rounded transition-colors cursor-pointer"
                          title="React"
                        >
                          <Smile className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Floating Emoji Picker Popover */}
                      {showEmojiPickerForMsgId === msg.id && (
                        <div 
                          className={`absolute top-full mt-1 bg-[#131520] border border-white/10 rounded-xl p-1.5 flex gap-1.5 shadow-xl z-40 ${
                            isSelf ? 'right-0' : 'left-0'
                          }`}
                        >
                          {['👍', '❤️', '🔥', '😂', '😮', '🎉'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(msg.id, emoji)}
                              className="hover:scale-125 transition-transform text-sm cursor-pointer p-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions display list below bubble */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(msg.reactions).map(([emoji, list]) => (
                          <div 
                            key={emoji}
                            className="bg-white/3 border border-white/5 px-1.5 py-0.5 rounded-full text-[9px] flex items-center gap-1.5 shadow-sm text-gray-400 font-black cursor-pointer hover:bg-white/5 hover:border-white/10 transition-colors"
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            title={`Reacted by: ${list.join(', ')}`}
                          >
                            <span>{emoji}</span>
                            <span>{list.length}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Floating scroll down new messages button */}
      {showNewMessagesBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 z-40 transition-all border border-cyan-400/25 animate-bounce active:scale-95 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>New Messages ({unreadNewCount})</span>
        </button>
      )}

      {/* Typing indicator bar */}
      <div className="h-4.5 overflow-hidden shrink-0 mt-1">
        <AnimatePresence>
          {typingPlayersNames.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="text-[9px] text-gray-500 font-extrabold tracking-wider flex items-center gap-1.5"
            >
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{typingPlayersNames.join(', ')} {typingPlayersNames.length === 1 ? 'is' : 'are'} typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply target preview bar */}
      {replyTarget && (
        <div className="bg-cyan-500/5 border border-cyan-500/20 px-3 py-2 rounded-xl flex items-center justify-between text-[10px] text-gray-300 shrink-0 mb-2 relative overflow-hidden animate-slide-up">
          <div className="flex items-center gap-2 overflow-hidden">
            <CornerUpLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-gray-200">Reply to {replyTarget.senderName}: </span>
              <span>{replyTarget.message}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setReplyTarget(null)}
            className="p-1 text-gray-400 hover:text-white rounded bg-white/5 border border-white/5 cursor-pointer text-[8px] uppercase font-black"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input controls form */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-white/5 pt-2 mt-1.5 shrink-0">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-medium placeholder-gray-600"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-all flex items-center justify-center shrink-0 cursor-pointer border border-purple-400/20 active:scale-90"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
