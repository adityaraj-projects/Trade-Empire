import React from 'react';
import { Player } from '../../types/game';
import { PlayerToken } from './PlayerToken';

interface TokenListProps {
  players: Player[];
}

export const TokenList: React.FC<TokenListProps> = ({ players }) => {
  if (players.length === 0) return null;

  let sizeClass = 'w-4 h-4 md:w-5 md:h-5 text-[8px] md:text-[9px]';
  if (players.length > 4) {
    sizeClass = 'w-2.5 h-2.5 text-[5px] font-black border-0.5';
  } else if (players.length > 2) {
    sizeClass = 'w-3.5 h-3.5 text-[7px]';
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center flex-wrap gap-0.5 p-1 bg-black/25 pointer-events-none z-10">
      {players.map((player) => (
        <PlayerToken key={player.id} player={player} sizeClass={sizeClass} />
      ))}
    </div>
  );
};
