import { IS_FIREBASE_MOCK } from '../firebase/config';
import { firebaseRoomService } from './firebaseRoomService';
import { GameSettings, Player, ClientActionPacket } from '../types/game';

export interface RoomService {
  createRoom(roomId: string, hostPlayer: Player, settings: GameSettings): Promise<string>;
  joinRoom(roomId: string, player: Player): Promise<string | null>;
  kickPlayer(roomId: string, playerId: string): Promise<void>;
  syncRoom(roomId: string, onUpdate: (roomState: any) => void): () => void;
  updateState(roomId: string, updates: any): Promise<void>;
  
  // Action Queues
  pushRequest(roomId: string, action: ClientActionPacket): Promise<void>;
  syncRequests(roomId: string, onRequests: (requests: { [id: string]: ClientActionPacket } | null) => void): () => void;
  deleteRequest(roomId: string, requestId: string): Promise<void>;

  // Chat Sync
  pushChatMessage(roomId: string, message: any): Promise<void>;
  syncChatMessages(roomId: string, onUpdate: (messages: any[] | null) => void): () => void;

  // Typing Indicators
  setTypingState(roomId: string, playerId: string, isTyping: boolean): Promise<void>;
  syncTypingState(roomId: string, onUpdate: (typing: { [playerId: string]: boolean } | null) => void): () => void;
}

// In-Memory Mock Room Service for offline play & local multiplayer
class MockRoomService implements RoomService {
  private rooms: { [roomId: string]: any } = {};
  private listeners: { [roomId: string]: ((state: any) => void)[] } = {};
  private chats: { [roomId: string]: any[] } = {};
  private chatListeners: { [roomId: string]: ((messages: any[]) => void)[] } = {};
  private typing: { [roomId: string]: { [playerId: string]: boolean } } = {};
  private typingListeners: { [roomId: string]: ((typing: any) => void)[] } = {};

  async createRoom(roomId: string, hostPlayer: Player, settings: GameSettings): Promise<string> {
    this.rooms[roomId] = {
      roomId,
      status: 'lobby',
      hostId: hostPlayer.id,
      players: [hostPlayer],
      activePlayerIndex: 0,
      dice: [1, 1],
      isDiceRolled: false,
      winnerId: null,
      settings,
      logs: [],
    };
    this.notify(roomId);
    return hostPlayer.id;
  }

  async joinRoom(roomId: string, player: Player): Promise<string | null> {
    const room = this.rooms[roomId];
    if (!room) return null;
    
    if (room.players.length >= room.settings.maxPlayers) return null;

    if (room.players.some((p: Player) => p.id === player.id)) {
      return player.id;
    }

    room.players.push(player);
    this.notify(roomId);
    return player.id;
  }

  async kickPlayer(roomId: string, playerId: string): Promise<void> {
    const room = this.rooms[roomId];
    if (!room) return;

    room.players = room.players.filter((p: any) => p.id !== playerId);
    this.notify(roomId);
  }

  syncRoom(roomId: string, onUpdate: (roomState: any) => void): () => void {
    if (!this.listeners[roomId]) {
      this.listeners[roomId] = [];
    }
    this.listeners[roomId].push(onUpdate);
    
    if (this.rooms[roomId]) {
      onUpdate(this.rooms[roomId]);
    }

    return () => {
      this.listeners[roomId] = this.listeners[roomId].filter(l => l !== onUpdate);
    };
  }

  async updateState(roomId: string, updates: any): Promise<void> {
    const room = this.rooms[roomId];
    if (!room) return;

    this.rooms[roomId] = { ...room, ...updates };
    this.notify(roomId);
  }

  // Request queue mocks (instantly process actions locally in mock mode)
  async pushRequest(roomId: string, action: ClientActionPacket): Promise<void> {
    // Under mock mode, operations are resolved locally inside useGameEngine, so we bypass queueing
  }

  syncRequests(roomId: string, onRequests: (requests: any) => void): () => void {
    return () => {};
  }

  async deleteRequest(roomId: string, requestId: string): Promise<void> {
    // No-op
  }

  async pushChatMessage(roomId: string, message: any): Promise<void> {
    if (!this.chats[roomId]) this.chats[roomId] = [];
    this.chats[roomId].push(message);
    if (this.chatListeners[roomId]) {
      this.chatListeners[roomId].forEach(cb => cb(this.chats[roomId]));
    }
  }

  syncChatMessages(roomId: string, onUpdate: (messages: any[] | null) => void): () => void {
    if (!this.chatListeners[roomId]) this.chatListeners[roomId] = [];
    this.chatListeners[roomId].push(onUpdate);
    onUpdate(this.chats[roomId] || []);
    return () => {
      this.chatListeners[roomId] = this.chatListeners[roomId].filter(cb => cb !== onUpdate);
    };
  }

  async setTypingState(roomId: string, playerId: string, isTyping: boolean): Promise<void> {
    if (!this.typing[roomId]) this.typing[roomId] = {};
    if (isTyping) {
      this.typing[roomId][playerId] = true;
    } else {
      delete this.typing[roomId][playerId];
    }
    if (this.typingListeners[roomId]) {
      this.typingListeners[roomId].forEach(cb => cb(this.typing[roomId]));
    }
  }

  syncTypingState(roomId: string, onUpdate: (typing: { [playerId: string]: boolean } | null) => void): () => void {
    if (!this.typingListeners[roomId]) this.typingListeners[roomId] = [];
    this.typingListeners[roomId].push(onUpdate);
    onUpdate(this.typing[roomId] || null);
    return () => {
      this.typingListeners[roomId] = this.typingListeners[roomId].filter(cb => cb !== onUpdate);
    };
  }

  private notify(roomId: string) {
    if (this.listeners[roomId]) {
      this.listeners[roomId].forEach(listener => listener(this.rooms[roomId]));
    }
  }
}

export const roomService: RoomService = IS_FIREBASE_MOCK 
  ? new MockRoomService() 
  : firebaseRoomService;
