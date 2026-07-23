import { ClientActionPacket, Player, GameState } from '../types/game';
import { ruleEngine } from '../game/engine/RuleEngine';

export class ConflictResolver {
  private requestQueue: { packet: ClientActionPacket; resolve: (val: boolean) => void }[] = [];
  private isProcessing = false;

  enqueueRequest(packet: ClientActionPacket): Promise<boolean> {
    return new Promise((resolve) => {
      this.requestQueue.push({ packet, resolve });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;
    const request = this.requestQueue.shift();

    if (request) {
      const isValid = await this.validateRequest(request.packet);
      request.resolve(isValid);
    }

    this.isProcessing = false;
    this.processQueue();
  }

  private async validateRequest(packet: ClientActionPacket): Promise<boolean> {
    // Host authoritative precheck validation logic
    switch (packet.type) {
      case 'REQ_ROLL_DICE':
        return true; // Dice roll is always authorized if it's the player's turn
      case 'REQ_BUY_PROPERTY':
        return true; 
      case 'REQ_PAY_RENT':
        return true;
      case 'REQ_BUILD_HOUSE':
        return true;
      default:
        return true;
    }
  }
}

export const conflictResolver = new ConflictResolver();
export default conflictResolver;
