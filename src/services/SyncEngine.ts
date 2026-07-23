import { presenceManager } from './PresenceManager';
import { roomSync } from './RoomSync';
import { conflictResolver } from './ConflictResolver';
import { snapshotSync } from './SnapshotSync';

export const SyncEngine = {
  presence: presenceManager,
  room: roomSync,
  conflict: conflictResolver,
  snapshot: snapshotSync,
};

export default SyncEngine;
