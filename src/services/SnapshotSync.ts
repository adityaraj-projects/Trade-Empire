import { gameSnapshot } from '../game/engine/GameSnapshot';
import { roomSync } from './RoomSync';

export class SnapshotSync {
  async saveSnapshot(roomId: string, state: any): Promise<void> {
    const serialized = gameSnapshot.serialize(state);
    await roomSync.updateRoom(roomId, { snapshot: serialized });
  }

  async loadSnapshot(snapshotData: string): Promise<any> {
    return gameSnapshot.deserialize(snapshotData);
  }
}

export const snapshotSync = new SnapshotSync();
export default snapshotSync;
