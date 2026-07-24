import React from 'react';
import { Player } from '../../types/game';
import { PLAYER_COLOR_MAP } from '../../components/PlayerList';

interface PlayerTokenProps {
  player: Player;
  sizeClass?: string;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({ player, sizeClass }) => {
  const initials = player.name.substring(0, 2).toUpperCase();
  const finalSizeClass = sizeClass || 'w-4 h-4 md:w-5 md:h-5 text-[8px] md:text-[9px]';

  return (
    <div
      className={`${finalSizeClass} rounded-full font-black text-slate-900 border border-white/60 flex items-center justify-center shadow-lg active-turn-indicator select-none transition-transform`}
      style={{
        backgroundColor: PLAYER_COLOR_MAP[player.color],
        boxShadow: `0 0 6px ${PLAYER_COLOR_MAP[player.color]}`,
      }}
      title={`${player.name} (${player.avatar})`}
    >
      {initials}
    </div>
  );
};
