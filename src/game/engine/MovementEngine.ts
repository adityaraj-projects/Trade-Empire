import { Player } from '../../types/game';

export class MovementEngine {
  async moveStepByStep(
    player: Player,
    steps: number,
    onStep: (currentPosition: number) => void,
    delayMs = 250
  ): Promise<number> {
    let currentPosition = player.position;

    for (let i = 0; i < steps; i++) {
      currentPosition = (currentPosition + 1) % 40;
      onStep(currentPosition);
      
      // Await delay
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return currentPosition;
  }
}

export const movementEngine = new MovementEngine();
export default movementEngine;
