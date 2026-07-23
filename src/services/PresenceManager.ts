import { eventBus } from '../game/engine/EventBus';

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'RECONNECTING' | 'LEFT';

export class PresenceManager {
  private heartbeatInterval: any = null;
  private presenceStates: { [playerId: string]: ConnectionState } = {};

  startHeartbeat(playerId: string, roomId: string) {
    this.stopHeartbeat();
    this.updatePresence(playerId, 'ONLINE');

    // Simulate sending client heartbeat every 15 seconds
    this.heartbeatInterval = setInterval(() => {
      eventBus.emit('PRESENCE_HEARTBEAT', { playerId, roomId, timestamp: Date.now() });
    }, 15000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  updatePresence(playerId: string, state: ConnectionState) {
    const oldState = this.presenceStates[playerId];
    if (oldState === state) return;

    this.presenceStates[playerId] = state;
    eventBus.emit('PRESENCE_CHANGED', { playerId, oldState, state });
  }

  getPresence(playerId: string): ConnectionState {
    return this.presenceStates[playerId] || 'OFFLINE';
  }
}

export const presenceManager = new PresenceManager();
export default presenceManager;
