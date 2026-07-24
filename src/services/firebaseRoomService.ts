import { RoomService } from './roomService';
import { database, auth } from '../firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { ref, set, update, onValue, get, onDisconnect, child, push, remove } from 'firebase/database';
import { GameSettings, Player, ClientActionPacket } from '../types/game';

class FirebaseRoomService implements RoomService {
  private authenticatedUid: string | null = null;

  private async ensureAuthenticated(): Promise<string> {
    if (this.authenticatedUid) return this.authenticatedUid;

    const userCred = await signInAnonymously(auth);
    this.authenticatedUid = userCred.user.uid;
    return this.authenticatedUid;
  }

  async createRoom(roomId: string, hostPlayer: Player, settings: GameSettings): Promise<string> {
    const uid = await this.ensureAuthenticated();
    
    const updatedHost: Player = {
      ...hostPlayer,
      id: uid,
    };

    const roomState = {
      roomId,
      status: 'lobby',
      hostId: uid,
      players: [updatedHost],
      activePlayerIndex: 0,
      dice: [1, 1],
      isDiceRolled: false,
      winnerId: null,
      settings,
      logs: [],
    };

    const roomRef = ref(database, `rooms/${roomId}/snapshot`);
    await set(roomRef, roomState);

    const presenceRef = ref(database, `rooms/${roomId}/snapshot/players/0`);
    onDisconnect(presenceRef).update({ connected: false });

    return uid;
  }

  async joinRoom(roomId: string, player: Player): Promise<string | null> {
    const isSimulated = player.id.startsWith('p-');
    const uid = isSimulated ? player.id : await this.ensureAuthenticated();
    
    const roomRef = ref(database, `rooms/${roomId}/snapshot`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return null;

    const roomState = snapshot.val();
    const currentPlayers: Player[] = roomState.players || [];

    if (currentPlayers.length >= roomState.settings.maxPlayers) return null;
    
    if (currentPlayers.some(p => p.id === uid)) {
      return uid;
    }

    const updatedPlayer: Player = {
      ...player,
      id: uid,
    };

    const updatedPlayers = [...currentPlayers, updatedPlayer];
    await update(roomRef, { players: updatedPlayers });

    if (!isSimulated) {
      const playerIndex = updatedPlayers.length - 1;
      const playerDisconnectRef = ref(database, `rooms/${roomId}/snapshot/players/${playerIndex}`);
      onDisconnect(playerDisconnectRef).update({ connected: false });
    }

    return uid;
  }

  async kickPlayer(roomId: string, playerId: string): Promise<void> {
    const roomRef = ref(database, `rooms/${roomId}/snapshot`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return;

    const roomState = snapshot.val();
    const updatedPlayers = (roomState.players || []).filter((p: Player) => p.id !== playerId);

    await update(roomRef, { players: updatedPlayers });
  }

  syncRoom(roomId: string, onUpdate: (roomState: any) => void): () => void {
    const roomRef = ref(database, `rooms/${roomId}/snapshot`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val());
      } else {
        onUpdate(null);
      }
    });

    return unsubscribe;
  }

  async updateState(roomId: string, updates: any): Promise<void> {
    const roomRef = ref(database, `rooms/${roomId}/snapshot`);
    await update(roomRef, updates);
  }

  // Host Authoritative Requests Queue
  async pushRequest(roomId: string, action: ClientActionPacket): Promise<void> {
    const requestsRef = ref(database, `rooms/${roomId}/requests`);
    await push(requestsRef, action);
  }

  syncRequests(roomId: string, onRequests: (requests: { [id: string]: ClientActionPacket } | null) => void): () => void {
    const requestsRef = ref(database, `rooms/${roomId}/requests`);
    return onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        onRequests(snapshot.val());
      } else {
        onRequests(null);
      }
    });
  }

  async deleteRequest(roomId: string, requestId: string): Promise<void> {
    const requestRef = ref(database, `rooms/${roomId}/requests/${requestId}`);
    await remove(requestRef);
  }

  async pushChatMessage(roomId: string, message: any): Promise<void> {
    const chatRef = ref(database, `rooms/${roomId}/chat`);
    await push(chatRef, message);
  }

  syncChatMessages(roomId: string, onUpdate: (messages: any[] | null) => void): () => void {
    const chatRef = ref(database, `rooms/${roomId}/chat`);
    return onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.values(val);
        onUpdate(list as any[]);
      } else {
        onUpdate([]);
      }
    });
  }

  async setTypingState(roomId: string, playerId: string, isTyping: boolean): Promise<void> {
    const typingRef = ref(database, `rooms/${roomId}/typing/${playerId}`);
    if (isTyping) {
      await set(typingRef, true);
    } else {
      await remove(typingRef);
    }
  }

  syncTypingState(roomId: string, onUpdate: (typing: { [playerId: string]: boolean } | null) => void): () => void {
    const typingRef = ref(database, `rooms/${roomId}/typing`);
    return onValue(typingRef, (snapshot) => {
      onUpdate(snapshot.exists() ? snapshot.val() : null);
    });
  }
}

export const firebaseRoomService = new FirebaseRoomService();
export default firebaseRoomService;
