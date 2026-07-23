import { GameState } from '../../types/game';

export class GameSnapshot {
  serialize(state: GameState): string {
    return JSON.stringify(state);
  }

  deserialize(json: string): GameState {
    const parsed = JSON.parse(json);
    
    // Perform any custom hydration / validation if necessary
    if (!parsed.roomId || !Array.isArray(parsed.players) || !Array.isArray(parsed.tiles)) {
      throw new Error('Invalid game snapshot format.');
    }
    
    return parsed as GameState;
  }
}

export const gameSnapshot = new GameSnapshot();
export default gameSnapshot;
