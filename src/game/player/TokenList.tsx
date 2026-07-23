import React from 'react';
import { Player } from '../../types/game';
import { PlayerToken } from './PlayerToken';

interface TokenListProps {
  players: Player[];
}

export const TokenList: React.FC<TokenListProps> = ({ players }) => {
  if (players.length === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center flex-wrap gap-1 p-2 bg-black/35 pointer-events-none z-10">
      {players.map((player) => (
        <PlayerToken key={player.id} player={player} />
      ))}
    </div>
  );
};
