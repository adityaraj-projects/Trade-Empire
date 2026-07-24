export type TileType =
  | 'start'
  | 'property'
  | 'railway'
  | 'utility'
  | 'tax'
  | 'card'
  | 'jail'
  | 'rest'
  | 'go_to_jail';

export interface PropertyDeed {
  id: string; // e.g. "prop-1"
  name: string; // e.g. "Mumbai"
  cost: number; // buy price (e.g. 4000)
  rent: number; // base rent (e.g. 400)
  rent1: number; // rent with 1 house
  rent2: number; // rent with 2 houses
  rent3: number; // rent with 3 houses
  rent4: number; // rent with 4 houses
  hotel: number; // rent with hotel
  mortgage: number; // cash returned on mortgage (e.g. 2000)
  houseCost: number; // build cost (e.g. 2000)
  group: 'brown' | 'cyan' | 'pink' | 'orange' | 'red' | 'yellow' | 'green' | 'blue' | 'railway' | 'utility';
  ownerId: string | null;
  housesCount: number; // 0 to 4 (houses), 5 represents a hotel
  isMortgaged: boolean;
}

export interface BoardTile {
  index: number;
  name: string;
  type: TileType;
  details?: PropertyDeed;
  description?: string;
  cost?: number; // for utilities or railways (fallback if details is absent)
}

export interface GameCard {
  id: string;
  title: string;
  deck: 'chance' | 'community';
  action: 'move' | 'money' | 'jail' | 'jail-release';
  value: number | string; // e.g. amount of cash or target index
}

export type PlayerColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'pink'
  | 'cyan'
  | 'orange'
  | 'emerald'
  | 'amber';

export interface Player {
  id: string;
  name: string;
  money: number;
  position: number; // 0 to 39
  properties: string[]; // Owned tile indices (as strings, e.g. ["1", "5"])
  houses: { [tileIndex: number]: number }; // number of houses built (5 means hotel)
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  connected: boolean;
  color: PlayerColor;
  avatar: string; // emoji or string representation
}

export interface GameSettings {
  startingMoney: number;
  salary: number;
  maxPlayers: number;
  jailFine: number;
  turnTimeLimit: number; // in seconds (e.g. 60)
}

export interface GameLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'roll' | 'buy' | 'rent' | 'tax' | 'jail' | 'system' | 'chat';
  playerName?: string;
}

export interface AuctionState {
  tileIndex: number;
  highestBid: number;
  highestBidderId: string | null;
  activeBidderIds: string[];
  currentBidderIndex: number;
}

export interface TradeProposal {
  senderId: string;
  receiverId: string;
  offeredCash: number;
  offeredProperties: number[];
  requestedCash: number;
  requestedProperties: number[];
}

export interface GameState {
  roomId: string;
  status: 'lobby' | 'playing' | 'ended';
  players: Player[];
  activePlayerIndex: number;
  tiles: BoardTile[];
  logs: GameLog[];
  dice: [number, number];
  isDiceRolled: boolean;
  settings: GameSettings;
  winnerId: string | null;
  auction?: AuctionState | null;
  pendingTrade?: TradeProposal | null;
}

export type GameFlowState = 
  | 'WAITING_ROLL' 
  | 'ROLLING' 
  | 'MOVING' 
  | 'PENDING_ACTION' 
  | 'ASSET_MGMT' 
  | 'END_TURN';

export type PageState = 'home' | 'create-room' | 'join-room' | 'lobby' | 'game-board';

export interface GameStoreState {
  // Navigation & Session
  page: PageState;
  roomId: string;
  localPlayerId: string; // The player running this browser instance
  
  // Game Room States
  status: 'lobby' | 'playing' | 'ended';
  hostId: string;
  players: Player[];
  activePlayerIndex: number;
  dice: [number, number];
  isDiceRolled: boolean;
  winnerId: string | null;
  settings: GameSettings;
  logs: GameLog[];
  
  // Actions
  setPage: (page: PageState) => void;
  createRoom: (hostName: string, settings: GameSettings) => void;
  joinRoom: (roomCode: string, playerName: string) => boolean;
  addLobbyPlayer: (name: string, color: PlayerColor) => void;
  kickPlayer: (playerId: string) => void;
  startNewGame: () => void;
  resetRoom: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

export type ClientActionPacket =
  | { type: 'REQ_ROLL_DICE'; playerId: string }
  | { type: 'REQ_BUY_PROPERTY'; playerId: string; tileIndex: number }
  | { type: 'REQ_DECLINE_PROPERTY'; playerId: string; tileIndex: number }
  | { type: 'REQ_PAY_RENT'; playerId: string; tileIndex: number }
  | { type: 'REQ_PAY_TAX'; playerId: string; tileIndex: number }
  | { type: 'REQ_BUILD_HOUSE'; playerId: string; tileIndex: number }
  | { type: 'REQ_SELL_HOUSE'; playerId: string; tileIndex: number }
  | { type: 'REQ_MORTGAGE'; playerId: string; tileIndex: number }
  | { type: 'REQ_UNMORTGAGE'; playerId: string; tileIndex: number }
  | { type: 'REQ_END_TURN'; playerId: string };

