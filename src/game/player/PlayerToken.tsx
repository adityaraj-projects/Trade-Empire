import React from 'react';
import { Player } from '../../types/game';
import { PLAYER_COLOR_MAP } from '../../components/PlayerList';

interface PlayerTokenProps {
  player: Player;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({ player }) => {
  const initials = player.name.substring(0, 2).toUpperCase();

  return (
    <div
      className="w-4 h-4 md:w-5 md:h-5 rounded-full text-[8px] md:text-[9px] font-black text-slate-900 border border-white/60 flex items-center justify-center shadow-lg active-turn-indicator transform scale-110 select-none transition-transform"
      style={{
        backgroundColor: PLAYER_COLOR_MAP[player.color],
        boxShadow: `0 0 10px ${PLAYER_COLOR_MAP[player.color]}`,
      }}
      title={`${player.name} (${player.avatar})`}
    >
      {initials}
    </div>
  );
};
