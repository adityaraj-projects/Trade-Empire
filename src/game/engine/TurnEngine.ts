import { Player } from '../../types/game';

export class TurnEngine {
  getNextPlayerIndex(players: Player[], currentIndex: number): number {
    let nextIndex = (currentIndex + 1) % players.length;
    let attempts = players.length;

    while (players[nextIndex].isBankrupt && attempts > 0) {
      nextIndex = (nextIndex + 1) % players.length;
      attempts--;
    }

    return nextIndex;
  }

  handleJailTurn(player: Player, rolledDouble: boolean): { inJail: boolean; jailTurns: number; releaseType: 'double' | 'failed' | 'none' } {
    if (!player.inJail) {
      return { inJail: false, jailTurns: 0, releaseType: 'none' };
    }

    if (rolledDouble) {
      return { inJail: false, jailTurns: 0, releaseType: 'double' };
    }

    const turns = player.jailTurns + 1;
    return { inJail: true, jailTurns: turns, releaseType: 'failed' };
  }
}

export const turnEngine = new TurnEngine();
export default turnEngine;
