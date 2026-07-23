import { describe, test, expect, beforeEach } from 'vitest';
import { diceEngine } from '../game/engine/DiceEngine';
import { turnEngine } from '../game/engine/TurnEngine';
import { bankEngine } from '../game/engine/BankEngine';
import { ruleEngine } from '../game/engine/RuleEngine';
import { gameSnapshot } from '../game/engine/GameSnapshot';
import { Player, GameState } from '../types/game';

describe('DiceEngine tests', () => {
  beforeEach(() => {
    diceEngine.resetDoubleCount();
  });

  test('should detect doubles correctly', () => {
    expect(diceEngine.isDouble([3, 3])).toBe(true);
    expect(diceEngine.isDouble([1, 6])).toBe(false);
  });

  test('should track consecutive doubles correctly', () => {
    diceEngine.roll(); // Mock count increments if double
    expect(diceEngine.getDoubleCount()).toBeLessThanOrEqual(1);
  });
});

describe('TurnEngine tests', () => {
  const dummyPlayers: Player[] = [
    { id: 'p-1', name: 'Addi', money: 1000, position: 0, properties: [], houses: {}, inJail: false, jailTurns: 0, isBankrupt: false, connected: true, color: 'purple', avatar: '😎' },
    { id: 'p-2', name: 'Rohit', money: 1000, position: 0, properties: [], houses: {}, inJail: false, jailTurns: 0, isBankrupt: true, connected: true, color: 'cyan', avatar: '🎮' },
    { id: 'p-3', name: 'Aman', money: 1000, position: 0, properties: [], houses: {}, inJail: false, jailTurns: 0, isBankrupt: false, connected: true, color: 'red', avatar: '🔥' },
  ];

  test('should skip bankrupt players correctly', () => {
    // Current is Addi (0). Next should skip Rohit (1) and land on Aman (2)
    const nextIdx = turnEngine.getNextPlayerIndex(dummyPlayers, 0);
    expect(nextIdx).toBe(2);
  });
});

describe('BankEngine tests', () => {
  const dummyPlayer: Player = {
    id: 'p-1', name: 'Addi', money: 1000, position: 0, properties: [], houses: {}, inJail: false, jailTurns: 0, isBankrupt: false, connected: true, color: 'purple', avatar: '😎'
  };

  test('should deposit funds correctly', () => {
    const updated = bankEngine.deposit(dummyPlayer, 500);
    expect(updated.money).toBe(1500);
  });

  test('should withdraw funds correctly', () => {
    const updated = bankEngine.withdraw(dummyPlayer, 200);
    expect(updated.money).toBe(800);
  });
});

describe('RuleEngine tests', () => {
  const dummyPlayer: Player = {
    id: 'p-1', name: 'Addi', money: 1000, position: 0, properties: [], houses: {}, inJail: false, jailTurns: 0, isBankrupt: false, connected: true, color: 'purple', avatar: '😎'
  };

  test('should check buying funds correctly', () => {
    expect(ruleEngine.canBuy(dummyPlayer, 800)).toBe(true);
    expect(ruleEngine.canBuy(dummyPlayer, 1200)).toBe(false);
  });
});

describe('GameSnapshot tests', () => {
  test('should serialize and deserialize game states correctly', () => {
    const dummyState: GameState = {
      roomId: 'ROOM123',
      status: 'playing',
      players: [],
      activePlayerIndex: 0,
      tiles: [],
      logs: [],
      dice: [3, 4],
      isDiceRolled: true,
      settings: { startingMoney: 15000, salary: 2000, maxPlayers: 10, jailFine: 500, turnTimeLimit: 0 },
      winnerId: null,
    };

    const serialized = gameSnapshot.serialize(dummyState);
    const deserialized = gameSnapshot.deserialize(serialized);

    expect(deserialized.roomId).toBe('ROOM123');
    expect(deserialized.dice).toEqual([3, 4]);
    expect(deserialized.settings.startingMoney).toBe(15000);
  });
});
