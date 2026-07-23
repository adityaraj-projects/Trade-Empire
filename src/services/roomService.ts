import { IS_FIREBASE_MOCK } from '../firebase/config';
import { firebaseRoomService } from './firebaseRoomService';
import { GameSettings, Player, ClientActionPacket } from '../types/game';

export interface RoomService {
  createRoom(roomId: string, hostPlayer: Player, settings: GameSettings): Promise<void>;
  joinRoom(roomId: string, player: Player): Promise<boolean>;
  kickPlayer(roomId: string, playerId: string): Promise<void>;
  syncRoom(roomId: string, onUpdate: (roomState: any) => void): () => void;
  updateState(roomId: string, updates: any): Promise<void>;
  
  // Action Queues
  pushRequest(roomId: string, action: ClientActionPacket): Promise<void>;
  syncRequests(roomId: string, onRequests: (requests: { [id: string]: ClientActionPacket } | null) => void): () => void;
  deleteRequest(roomId: string, requestId: string): Promise<void>;
}

// In-Memory Mock Room Service for offline play & local multiplayer
class MockRoomService implements RoomService {
  private rooms: { [roomId: string]: any } = {};
  private listeners: { [roomId: string]: ((state: any) => void)[] } = {};

  async createRoom(roomId: string, hostPlayer: Player, settings: GameSettings): Promise<void> {
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
  }

  async joinRoom(roomId: string, player: Player): Promise<boolean> {
    const room = this.rooms[roomId];
    if (!room) return false;
    
    if (room.players.length >= room.settings.maxPlayers) return false;

    if (room.players.some((p: Player) => p.id === player.id)) {
      return true;
    }

    room.players.push(player);
    this.notify(roomId);
    return true;
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

  private notify(roomId: string) {
    if (this.listeners[roomId]) {
      this.listeners[roomId].forEach(listener => listener(this.rooms[roomId]));
    }
  }
}

export const roomService: RoomService = IS_FIREBASE_MOCK 
  ? new MockRoomService() 
  : firebaseRoomService;
