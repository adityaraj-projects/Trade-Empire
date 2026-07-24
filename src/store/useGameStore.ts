import { create } from 'zustand';
import { GameStoreState, PageState, GameSettings, Player, PlayerColor } from '../types/game';
import { roomService } from '../services/roomService';

const DEFAULT_SETTINGS: GameSettings = {
  startingMoney: 15000,
  salary: 2000,
  maxPlayers: 10,
  jailFine: 500,
  turnTimeLimit: 60,
};

const AVAILABLE_COLORS: PlayerColor[] = [
  'purple', 'cyan', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'emerald', 'amber'
];

const EMOJIS = ['😎', '🎮', '🔥', '👑', '🎲', '🍕', '🦁', '🚀', '⚡', '👻'];

let roomUnsubscribe: (() => void) | null = null;

// Extend GameStoreState interface with the updateSettings action
export interface GameStoreWithSettingsState extends GameStoreState {
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const useGameStore = create<GameStoreWithSettingsState>((set, get) => ({
  // Navigation & Session Initial States
  page: 'home',
  roomId: '',
  localPlayerId: '',
  
  // Game Room Initial States
  status: 'lobby',
  hostId: '',
  players: [],
  activePlayerIndex: 0,
  dice: [1, 1],
  isDiceRolled: false,
  winnerId: null,
  settings: DEFAULT_SETTINGS,
  logs: [],

  // Set Page Routing
  setPage: (page: PageState) => set({ page }),

  // Create Room
  createRoom: (hostName: string, customSettings: GameSettings) => {
    // Generate random 6-character room code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hostId = 'p-1';
    const hostPlayer: Player = {
      id: hostId,
      name: hostName.trim() || 'Addi (Host)',
      money: customSettings.startingMoney,
      position: 0,
      properties: [],
      houses: {},
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      connected: true,
      color: 'purple',
      avatar: '😎',
    };

    // Unsubscribe from previous room if any
    if (roomUnsubscribe) {
      roomUnsubscribe();
    }

    // Initialize Room in Service
    roomService.createRoom(code, hostPlayer, customSettings).then((actualHostId) => {
      // Sync store with room updates
      roomUnsubscribe = roomService.syncRoom(code, (roomState) => {
        if (roomState) {
          if (roomState.status === 'ended' && roomState.winnerId === 'closed') {
            alert('Room has been closed by the Host.');
            get().resetRoom();
            return;
          }
          if (roomState.status === 'playing' && get().page === 'lobby') {
            set({ page: 'game-board' });
          }
          set({
            roomId: roomState.roomId,
            hostId: roomState.hostId,
            players: (roomState.players || []).map((p: any) => ({
              ...p,
              properties: p.properties || [],
              houses: p.houses || {},
            })),
            status: roomState.status,
            settings: roomState.settings,
            logs: roomState.logs || [],
          });
        }
      });

      set({
        page: 'lobby',
        localPlayerId: actualHostId,
      });
    });
  },

  // Join Room
  joinRoom: (roomCode: string, playerName: string) => {
    const cleanedCode = roomCode.toUpperCase().trim();
    if (!cleanedCode || !playerName.trim()) return false;

    // Unsubscribe from previous room if any
    if (roomUnsubscribe) {
      roomUnsubscribe();
    }

    // Determine unused color (simulated local check before join)
    let unusedColor: PlayerColor = 'cyan';
    let newPlayerId = 'p-2';
    
    roomUnsubscribe = roomService.syncRoom(cleanedCode, (roomState) => {
      if (roomState) {
        if (roomState.status === 'ended' && roomState.winnerId === 'closed') {
          alert('Room has been closed by the Host.');
          get().resetRoom();
          return;
        }
        if (roomState.status === 'playing' && get().page === 'lobby') {
          set({ page: 'game-board' });
        }
        
        const mappedPlayers = (roomState.players || []).map((p: any) => ({
          ...p,
          properties: p.properties || [],
          houses: p.houses || {},
        }));

        set({
          roomId: roomState.roomId,
          hostId: roomState.hostId,
          players: mappedPlayers,
          status: roomState.status,
          settings: roomState.settings,
          logs: roomState.logs || [],
        });

        // Compute unused colors
        const currentPlayers = mappedPlayers;
        const color = AVAILABLE_COLORS.find(c => !currentPlayers.some(p => p.color === c)) || 'cyan';
        unusedColor = color;
        newPlayerId = `p-${currentPlayers.length + 1}`;
      }
    });

    const newPlayer: Player = {
      id: newPlayerId,
      name: playerName.trim(),
      money: get().settings.startingMoney,
      position: 0,
      properties: [],
      houses: {},
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      connected: true,
      color: unusedColor,
      avatar: EMOJIS[get().players.length % EMOJIS.length] || '🎮',
    };

    // Join room
    roomService.joinRoom(cleanedCode, newPlayer).then((actualPlayerId) => {
      if (actualPlayerId) {
        set({
          page: 'lobby',
          localPlayerId: actualPlayerId,
        });
      } else {
        if (roomUnsubscribe) {
          roomUnsubscribe();
          roomUnsubscribe = null;
        }
        alert('Lobby is full or does not exist!');
      }
    });

    return true;
  },

  // Update lobby settings parameters
  updateSettings: (newSettings: Partial<GameSettings>) => {
    const currentStore = get();
    const updatedSettings = { ...currentStore.settings, ...newSettings };
    
    // Propagate to room service, which automatically triggers updates to all clients
    roomService.updateState(currentStore.roomId, { settings: updatedSettings });
  },

  // Add Lobby Player (simulates others joining locally)
  addLobbyPlayer: (name: string, color: PlayerColor) => {
    const currentStore = get();
    if (currentStore.players.length >= currentStore.settings.maxPlayers) return;

    const newPlayerId = `p-${currentStore.players.length + 1}`;
    const newPlayer: Player = {
      id: newPlayerId,
      name: name.trim() || `Player ${currentStore.players.length + 1}`,
      money: currentStore.settings.startingMoney,
      position: 0,
      properties: [],
      houses: {},
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      connected: true,
      color: color,
      avatar: EMOJIS[currentStore.players.length % EMOJIS.length] || '🦁',
    };

    roomService.joinRoom(currentStore.roomId, newPlayer);
  },

  // Kick player (Host action)
  kickPlayer: (playerId: string) => {
    const currentStore = get();
    if (playerId === currentStore.hostId) return;

    roomService.kickPlayer(currentStore.roomId, playerId);
  },

  // Start the game
  startNewGame: () => {
    const currentStore = get();
    roomService.updateState(currentStore.roomId, {
      status: 'playing',
      activePlayerIndex: 0,
      dice: [1, 1],
      isDiceRolled: false,
      winnerId: null,
    }).then(() => {
      set({
        page: 'game-board',
      });
    });
  },

  // Reset/Leave Game (with Host Cancellation logic)
  resetRoom: () => {
    const currentStore = get();
    
    if (roomUnsubscribe) {
      roomUnsubscribe();
      roomUnsubscribe = null;
    }

    if (currentStore.roomId) {
      const isHost = currentStore.localPlayerId === currentStore.hostId;
      if (isHost) {
        // Destroy room for everyone
        roomService.updateState(currentStore.roomId, {
          status: 'ended',
          winnerId: 'closed',
        });
      } else {
        // Just remove local player from list
        const updatedPlayers = currentStore.players.filter(p => p.id !== currentStore.localPlayerId);
        roomService.updateState(currentStore.roomId, {
          players: updatedPlayers,
        });
      }
    }

    set({
      page: 'home',
      roomId: '',
      localPlayerId: '',
      status: 'lobby',
      hostId: '',
      players: [],
      activePlayerIndex: 0,
      isDiceRolled: false,
      winnerId: null,
      logs: [],
    });
  },
}));
