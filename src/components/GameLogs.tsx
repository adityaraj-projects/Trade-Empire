import React, { useEffect, useRef } from 'react';
import { GameLog } from '../types/game';
import { Play, RotateCcw, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';

interface GameLogsProps {
  logs: GameLog[];
}

export const GameLogs: React.FC<GameLogsProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeLogs = logs || [];

  useEffect(() => {
    // Scroll to top since logs are unshifted (newest first in state)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [safeLogs]);

  const getLogIcon = (type: GameLog['type']) => {
    switch (type) {
      case 'roll':
        return <RotateCcw className="w-3.5 h-3.5 text-purple-400" />;
      case 'buy':
        return <Play className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rent':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'jail':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Play className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getLogClass = (type: GameLog['type']) => {
    switch (type) {
      case 'roll':
        return 'text-purple-300 bg-purple-500/5 border-purple-500/10';
      case 'buy':
        return 'text-emerald-300 bg-emerald-500/5 border-emerald-500/10';
      case 'rent':
        return 'text-rose-300 bg-rose-500/5 border-rose-500/10';
      case 'jail':
        return 'text-amber-300 bg-amber-500/5 border-amber-500/10';
      case 'system':
        return 'text-cyan-300 bg-cyan-500/5 border-cyan-500/10';
      default:
        return 'text-gray-300 bg-white/3 border-white/5';
    }
  };

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block">Game Feeds</span>
      
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 no-scrollbar min-h-[8rem]"
      >
        {safeLogs.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-6">No feeds yet. Let's roll!</div>
        ) : (
          safeLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs leading-relaxed transition-all ${getLogClass(
                log.type
              )}`}
            >
              <div className="mt-0.5 shrink-0">{getLogIcon(log.type)}</div>
              <div className="flex-1">
                <span className="text-gray-400 text-[10px] mr-1.5 font-semibold font-mono">{log.timestamp}</span>
                <span>{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
