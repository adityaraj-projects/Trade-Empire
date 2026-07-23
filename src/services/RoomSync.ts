import { roomService } from './roomService';

export class RoomSync {
  syncRoom(roomId: string, onUpdate: (state: any) => void): () => void {
    // Bridges Zustand / UI updates with the core roomService subscription
    return roomService.syncRoom(roomId, onUpdate);
  }

  async updateRoom(roomId: string, updates: any): Promise<void> {
    await roomService.updateState(roomId, updates);
  }
}

export const roomSync = new RoomSync();
export default roomSync;
