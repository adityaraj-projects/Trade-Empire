import { useState, useCallback } from 'react';
import { GameState, Player, PlayerColor, GameSettings, GameLog, BoardTile, TradeProposal } from '../types/game';
import { BOARD_TILES, CHANCE_DECK, COMMUNITY_DECK } from '../constants/boardData';
import { diceEngine } from '../game/engine/DiceEngine';
import { turnEngine } from '../game/engine/TurnEngine';
import { movementEngine } from '../game/engine/MovementEngine';
import { eventBus } from '../game/engine/EventBus';
import { stateMachine } from '../game/engine/StateMachine';
import { bankEngine } from '../game/engine/BankEngine';
import { propertyEngine } from '../game/engine/PropertyEngine';
import { cardEngine } from '../game/engine/CardEngine';
import { ruleEngine } from '../game/engine/RuleEngine';
import { replayLogger } from '../game/engine/ReplayLogger';

const DEFAULT_SETTINGS: GameSettings = {
  startingMoney: 15000,
  salary: 2000,
  maxPlayers: 10,
  jailFine: 500,
  turnTimeLimit: 0,
};

export type PendingActionType =
  | { type: 'buy_or_decline'; tileIndex: number }
  | { type: 'pay_rent'; tileIndex: number; rentAmount: number; ownerId: string }
  | { type: 'pay_tax'; tileIndex: number; taxAmount: number }
  | { type: 'draw_card'; cardType: 'vyapaar' | 'chance'; cardText: string; moneyChange: number; newPosition?: number }
  | { type: 'bankruptcy_warning'; owedTo: 'bank' | string; amount: number }
  | null;

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    roomId: 'LOCAL_ROOM',
    status: 'lobby',
    players: [],
    activePlayerIndex: 0,
    tiles: BOARD_TILES,
    logs: [],
    dice: [1, 1],
    isDiceRolled: false,
    settings: DEFAULT_SETTINGS,
    winnerId: null,
  });

  const [pendingAction, setPendingAction] = useState<PendingActionType>(null);
  const [diceRolling, setDiceRolling] = useState(false);

  // Helper to add a log entry
  const addLog = useCallback((message: string, type: GameLog['type'], playerName?: string) => {
    const newLog: GameLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type,
      playerName,
    };
    setGameState((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 100), // Keep last 100 logs
    }));
  }, []);

  // Initialize a new local game
  const initializeGame = useCallback((playersData: { id?: string; name: string; color: PlayerColor }[]) => {
    const EMOJIS = ['😎', '🎮', '🔥', '👑', '🎲', '🍕', '🦁', '🚀', '⚡', '👻'];
    const newPlayers: Player[] = playersData.map((p, idx) => ({
      id: p.id || `p-${idx + 1}`,
      name: p.name,
      color: p.color,
      position: 0,
      money: gameState.settings.startingMoney,
      isBankrupt: false,
      inJail: false,
      jailTurns: 0,
      properties: [],
      houses: {},
      connected: true,
      avatar: EMOJIS[idx % EMOJIS.length] || '😎',
    }));

    setGameState((prev) => ({
      ...prev,
      status: 'playing',
      players: newPlayers,
      activePlayerIndex: 0,
      dice: [1, 1],
      isDiceRolled: false,
      winnerId: null,
      logs: [],
    }));
    setPendingAction(null);

    // Initial logs
    const initialLogText = `Game started with players: ${playersData.map(p => p.name).join(', ')}.`;
    const startLog: GameLog = {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: initialLogText,
      type: 'system',
    };
    setGameState((prev) => ({
      ...prev,
      logs: [startLog],
    }));
  }, [gameState.settings.startingMoney]);

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  // Helper to check if a player owns all properties in a group
  const ownsFullGroup = useCallback((player: Player, groupId: string) => {
    const groupProperties = BOARD_TILES.filter(t => t.type === 'property' && t.details?.group === groupId);
    return groupProperties.every(t => player.properties.includes(t.index.toString()));
  }, []);

  // Calculate utility rent
  const getUtilityRent = useCallback((owner: Player, diceSum: number) => {
    const utilitiesOwnedCount = BOARD_TILES.filter(
      t => t.type === 'utility' && owner.properties.includes(t.index.toString())
    ).length;

    // 1 utility: 100x sum, 2 utilities: 150x, 3 utilities: 200x, 4 utilities: 250x
    const multiplier = 100 + (utilitiesOwnedCount - 1) * 50;
    return diceSum * multiplier;
  }, []);

  // Calculate railway rent
  const getRailwayRent = useCallback((owner: Player) => {
    const railwaysOwnedCount = BOARD_TILES.filter(
      t => t.type === 'railway' && owner.properties.includes(t.index.toString())
    ).length;

    // Rent doubles for each railway owned
    // 1 railway: ₹250, 2 railways: ₹500, 3 railways: ₹1,000, 4 railways: ₹2,000
    return 250 * Math.pow(2, railwaysOwnedCount - 1);
  }, []);

  // Calculate rent for a property tile
  const calculateRent = useCallback((tile: BoardTile, owner: Player, diceSum: number) => {
    if (!tile.details) {
      if (tile.type === 'railway') return getRailwayRent(owner);
      if (tile.type === 'utility') return getUtilityRent(owner, diceSum);
      return 0;
    }

    const { rent, rent1, rent2, rent3, rent4, hotel, group: groupId } = tile.details;
    const tileIndex = tile.index;
    const houseCount = owner.houses[tileIndex] || 0;

    // Rent tiers based on houses: 0=base, 1-4=houses, 5=hotel
    const tierMap = [rent, rent1, rent2, rent3, rent4, hotel] as const;

    if (houseCount === 5) return hotel;
    if (houseCount > 0) return tierMap[houseCount];
    if (ownsFullGroup(owner, groupId)) return rent * 2;
    return rent;
  }, [ownsFullGroup, getRailwayRent, getUtilityRent]);

  // Handle tile land actions
  const handleLanding = useCallback((player: Player, position: number, diceSum: number) => {
    const tile = BOARD_TILES[position];
    addLog(`${player.name} landed on ${tile.name}.`, 'info', player.name);

    // 1. Check if it's a corner / start
    if (tile.type === 'start' || tile.type === 'rest' || tile.type === 'jail') {
      // Nothing automatic
      return;
    }

    // 2. Go to jail tile
    if (tile.type === 'go_to_jail') {
      setGameState(prev => {
        const updatedPlayers = prev.players.map(p =>
          p.id === player.id ? { ...p, inJail: true, position: 10, jailTurns: 0 } : p
        );
        return { ...prev, players: updatedPlayers };
      });
      addLog(`${player.name} was sent directly to Jail!`, 'jail', player.name);
      return;
    }

    // 3. Tax tiles
    if (tile.type === 'tax') {
      const taxAmount = tile.cost || 1000;
      setPendingAction({ type: 'pay_tax', tileIndex: position, taxAmount });
      return;
    }

    // 4. Cards (Vyapaar / Chance)
    if (tile.type === 'card') {
      const cardType = tile.name.toLowerCase().includes('vyapaar') ? 'vyapaar' : 'chance';
      const deck = cardType === 'vyapaar' ? COMMUNITY_DECK : CHANCE_DECK;
      const randomCard = deck[Math.floor(Math.random() * deck.length)];

      let moneyChange = 0;
      let newPosition: number | undefined;
      let message = randomCard.title;

      if (randomCard.action === 'money') {
        moneyChange = Number(randomCard.value);
      } else if (randomCard.action === 'move') {
        newPosition = Number(randomCard.value);
      } else if (randomCard.action === 'jail') {
        newPosition = 10; // Jail index
      }

      setPendingAction({
        type: 'draw_card',
        cardType,
        cardText: message,
        moneyChange,
        newPosition
      });
      return;
    }

    // 5. Properties, Railways, Utilities
    if (tile.type === 'property' || tile.type === 'railway' || tile.type === 'utility') {
      // Find owner
      let tileOwner: Player | undefined;
      setGameState(prev => {
        tileOwner = prev.players.find(p => p.properties.includes(position.toString()));
        return prev;
      });

      if (!tileOwner) {
        // Unowned property: Prompt to buy
        setPendingAction({ type: 'buy_or_decline', tileIndex: position });
      } else if (tileOwner.id !== player.id && !tileOwner.isBankrupt) {
        // Owned by someone else: Rent due!
        const rentAmount = calculateRent(tile, tileOwner, diceSum);
        setPendingAction({
          type: 'pay_rent',
          tileIndex: position,
          rentAmount,
          ownerId: tileOwner.id,
        });
      } else {
        addLog(`${player.name} already owns this property.`, 'info', player.name);
      }
    }
  }, [addLog, calculateRent]);

  // Helper to walk token cell-by-cell
  const walkSteps = useCallback(async (player: Player, steps: number) => {
    stateMachine.transitionTo('MOVING');

    const finalPos = await movementEngine.moveStepByStep(player, steps, (currentPos) => {
      setGameState(prev => {
        const players = prev.players.map(p =>
          p.id === player.id ? { ...p, position: currentPos } : p
        );
        return { ...prev, players };
      });
      eventBus.emit('PLAYER_STEP', { player: player.name, position: currentPos });
    });

    stateMachine.transitionTo('PENDING_ACTION');

    // Check if player passed START (index 0)
    if (finalPos < player.position) {
      setGameState(prev => {
        const players = prev.players.map(p =>
          p.id === player.id ? { ...p, money: p.money + prev.settings.salary } : p
        );
        return { ...prev, players };
      });

      const salaryLog: GameLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: `${player.name} passed START and collected ₹${gameState.settings.salary} salary.`,
        type: 'tax',
        playerName: player.name,
      };

      setGameState(prev => ({
        ...prev,
        logs: [salaryLog, ...prev.logs].slice(0, 100)
      }));
    }

    // Land action trigger — use steps param (the dice sum) instead of stale gameState.dice
    setTimeout(() => {
      handleLanding(player, finalPos, steps);
      stateMachine.transitionTo('PENDING_ACTION');
    }, 0);

  }, [gameState.settings.salary, handleLanding]);

  // Roll dice action
  const rollDice = useCallback(() => {
    if (gameState.isDiceRolled || pendingAction || diceRolling) return;

    setDiceRolling(true);
    stateMachine.transitionTo('ROLLING');
    addLog(`${activePlayer.name} is rolling dice...`, 'info', activePlayer.name);

    setTimeout(async () => {
      const [d1, d2] = diceEngine.roll();
      const diceSum = d1 + d2;
      const isDouble = diceEngine.isDouble([d1, d2]);

      setDiceRolling(false);
      
      setGameState(prev => ({
        ...prev,
        dice: [d1, d2],
        isDiceRolled: true,
      }));

      const rollLog: GameLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: `${activePlayer.name} rolled ${d1} & ${d2} (Total: ${diceSum}).`,
        type: 'roll',
        playerName: activePlayer.name,
      };

      setGameState(prev => ({
        ...prev,
        logs: [rollLog, ...prev.logs].slice(0, 100),
      }));

      eventBus.emit('ROLL_DICE', { player: activePlayer.name, dice: [d1, d2] });

      if (activePlayer.inJail) {
        const jailResult = turnEngine.handleJailTurn(activePlayer, isDouble);
        
        setGameState(prev => {
          const players = prev.players.map(p =>
            p.id === activePlayer.id
              ? { ...p, inJail: jailResult.inJail, jailTurns: jailResult.jailTurns }
              : p
          );
          return { ...prev, players };
        });

        if (jailResult.releaseType === 'double') {
          const jailReleaseLog: GameLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `${activePlayer.name} rolled doubles! Released from jail!`,
            type: 'jail',
            playerName: activePlayer.name,
          };
          setGameState(prev => ({
            ...prev,
            logs: [jailReleaseLog, ...prev.logs].slice(0, 100),
          }));
          
          await walkSteps(activePlayer, diceSum);
        } else {
          const jailFailLog: GameLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `${activePlayer.name} did not roll doubles. Remains in jail (Turn ${jailResult.jailTurns}/3).`,
            type: 'jail',
            playerName: activePlayer.name,
          };
          setGameState(prev => ({
            ...prev,
            logs: [jailFailLog, ...prev.logs].slice(0, 100),
          }));

          if (jailResult.jailTurns >= 3) {
            setTimeout(() => {
              setPendingAction({
                type: 'pay_tax',
                tileIndex: 10,
                taxAmount: gameState.settings.jailFine
              });
              stateMachine.transitionTo('PENDING_ACTION');
            }, 100);
          } else {
            stateMachine.transitionTo('END_TURN');
          }
        }
      } else {
        // Evaluate doubles and triple doubles
        if (isDouble) {
          if (diceEngine.hasTripleDouble()) {
            setGameState(prev => {
              const players = prev.players.map(p =>
                p.id === activePlayer.id ? { ...p, inJail: true, position: 10, jailTurns: 0 } : p
              );
              return {
                ...prev,
                players,
                isDiceRolled: true,
              };
            });
            diceEngine.resetDoubleCount();
            addLog(`${activePlayer.name} rolled 3 doubles in a row! Sent directly to Jail!`, 'jail', activePlayer.name);
            stateMachine.transitionTo('END_TURN');
            return;
          } else {
            setGameState(prev => ({
              ...prev,
              isDiceRolled: false,
            }));
            addLog(`${activePlayer.name} rolled doubles and gets to roll again!`, 'info', activePlayer.name);
          }
        } else {
          diceEngine.resetDoubleCount();
        }

        await walkSteps(activePlayer, diceSum);
      }
    }, 800);

  }, [gameState.isDiceRolled, pendingAction, diceRolling, activePlayer, addLog, walkSteps, gameState.settings.jailFine]);

  // Buy current property
  const buyProperty = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'buy_or_decline') return;

    const tileIndex = pendingAction.tileIndex;
    const tile = BOARD_TILES[tileIndex];
    const cost = tile.details?.cost || tile.cost || 0;

    if (!ruleEngine.canBuy(activePlayer, cost)) {
      addLog(`Not enough cash to buy ${tile.name}! You need ₹${cost}.`, 'system', activePlayer.name);
      return;
    }

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx !== prev.activePlayerIndex) return p;
        return propertyEngine.buy(p, tileIndex, cost);
      });

      return {
        ...prev,
        players: updatedPlayers,
      };
    });

    const buyLog = replayLogger.logPurchase(activePlayer.name, tile.name, cost);
    setGameState(prev => ({ ...prev, logs: [buyLog, ...prev.logs].slice(0, 100) }));
    setPendingAction(null);
  }, [pendingAction, activePlayer]);

  // Decline property purchase -> Trigger Auction
  const declineProperty = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'buy_or_decline') return;
    const tileIndex = pendingAction.tileIndex;
    const tile = BOARD_TILES[tileIndex];
    
    addLog(`${activePlayer.name} passed on buying ${tile.name}. Starting auction!`, 'info', activePlayer.name);
    
    setGameState((prev) => {
      const auction = propertyEngine.startAuction(tileIndex, prev.players, prev.activePlayerIndex);
      return {
        ...prev,
        auction,
      };
    });

    setPendingAction(null);
  }, [pendingAction, activePlayer, addLog]);

  // Check if player has enough money, else warn bankruptcy
  const chargeMoney = useCallback((player: Player, amount: number, owedTo: 'bank' | string) => {
    if (ruleEngine.canBuy(player, amount)) {
      setGameState((prev) => {
        const updatedPlayers = prev.players.map((p) => {
          if (p.id === player.id) {
            return bankEngine.withdraw(p, amount);
          }
          if (owedTo !== 'bank' && p.id === owedTo) {
            return bankEngine.deposit(p, amount);
          }
          return p;
        });
        return { ...prev, players: updatedPlayers };
      });
      return true;
    } else {
      // Set bankruptcy pending screen
      setPendingAction({
        type: 'bankruptcy_warning',
        owedTo,
        amount
      });
      return false;
    }
  }, []);

  // Pay rent
  const payRent = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'pay_rent') return;

    const { rentAmount, ownerId, tileIndex } = pendingAction;
    const tile = BOARD_TILES[tileIndex];
    const ownerName = gameState.players.find(p => p.id === ownerId)?.name || 'Owner';

    const success = chargeMoney(activePlayer, rentAmount, ownerId);
    if (success) {
      addLog(
        `${activePlayer.name} paid ₹${rentAmount} rent to ${ownerName} for landing on ${tile.name}.`,
        'rent',
        activePlayer.name
      );
      setPendingAction(null);
    }
  }, [pendingAction, activePlayer, chargeMoney, gameState.players, addLog]);

  // Pay tax / fine
  const payTax = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'pay_tax') return;

    const { taxAmount, tileIndex } = pendingAction;
    const tile = BOARD_TILES[tileIndex];

    const success = chargeMoney(activePlayer, taxAmount, 'bank');
    if (success) {
      if (tileIndex === 10) {
        // Released from jail via fine
        setGameState(prev => {
          const players = prev.players.map(p =>
            p.id === activePlayer.id ? { ...p, inJail: false, jailTurns: 0 } : p
          );
          return { ...prev, players };
        });
        addLog(`${activePlayer.name} paid ₹${taxAmount} fine and got out of Jail.`, 'jail', activePlayer.name);
      } else {
        addLog(`${activePlayer.name} paid ₹${taxAmount} tax to the Bank.`, 'tax', activePlayer.name);
      }
      setPendingAction(null);
    }
  }, [pendingAction, activePlayer, chargeMoney, addLog]);

  // Draw card action trigger
  const confirmCardAction = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'draw_card') return;

    const { moneyChange, newPosition } = pendingAction;

    setGameState((prev) => {
      let players = [...prev.players];
      let activeIdx = prev.activePlayerIndex;
      let player = players[activeIdx];

      // Handle position change
      if (newPosition !== undefined) {
        const oldPos = player.position;
        player.position = newPosition;

        // If advancing to start, jail, or checking passed START
        if (newPosition === 10) {
          // jail
          player.inJail = true;
          player.jailTurns = 0;
        } else if (newPosition < oldPos && newPosition !== 20 && newPosition !== 10) {
          // passed START
          player.money += prev.settings.salary;
        }
      }

      // Handle money change
      player.money += moneyChange;

      return {
        ...prev,
        players,
      };
    });

    addLog(
      `${activePlayer.name} resolved card: "${pendingAction.cardText}"`,
      'info',
      activePlayer.name
    );

    // If new position requires landing logic again
    if (newPosition !== undefined && newPosition !== 20 && newPosition !== 10) {
      const diceSum = gameState.dice[0] + gameState.dice[1];
      setTimeout(() => handleLanding(activePlayer, newPosition, diceSum), 100);
    }

    setPendingAction(null);
  }, [pendingAction, activePlayer, addLog, gameState.dice, handleLanding]);

  // Declare Bankruptcy
  const declareBankruptcy = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'bankruptcy_warning') return;

    const { owedTo, amount } = pendingAction;
    const recipientName = owedTo === 'bank' ? 'the Bank' : gameState.players.find(p => p.id === owedTo)?.name || 'Owner';

    addLog(
      `${activePlayer.name} declared bankruptcy! Owed ₹${amount} to ${recipientName}.`,
      'system',
      activePlayer.name
    );

    setGameState((prev) => {
      // Reset properties owned by player back to bank
      const updatedPlayers = prev.players.map((p) => {
        if (p.id === activePlayer.id) {
          return {
            ...p,
            isBankrupt: true,
            money: 0,
            properties: [],
            houses: {},
          };
        }
        // If owed to another player, give remaining money and assets to them
        if (owedTo !== 'bank' && p.id === owedTo) {
          return {
            ...p,
            money: p.money + Math.max(0, activePlayer.money),
            properties: [...p.properties, ...activePlayer.properties],
          };
        }
        return p;
      });

      // Check win condition
      const activePlayers = updatedPlayers.filter((p) => !p.isBankrupt);
      const isEnded = activePlayers.length === 1;
      const winnerId = isEnded ? activePlayers[0].id : null;

      return {
        ...prev,
        status: isEnded ? 'ended' : prev.status,
        players: updatedPlayers,
        winnerId,
      };
    });

    setPendingAction(null);

    // End turn automatically since player is bankrupt
    setTimeout(() => {
      setGameState(prev => {
        // Find next active player
        let nextIdx = (prev.activePlayerIndex + 1) % prev.players.length;
        let limit = prev.players.length;
        while (prev.players[nextIdx].isBankrupt && limit > 0) {
          nextIdx = (nextIdx + 1) % prev.players.length;
          limit--;
        }
        return {
          ...prev,
          activePlayerIndex: nextIdx,
          isDiceRolled: false,
        };
      });
    }, 100);

  }, [pendingAction, activePlayer, gameState.players, addLog]);

  // Build house / hotel on property
  const buildHouse = useCallback((tileIndex: number) => {
    const tile = BOARD_TILES[tileIndex];
    if (!tile.details) return;

    const houseCost = tile.details.houseCost;
    const isOwnedGroup = ownsFullGroup(activePlayer, tile.details.group);

    if (!ruleEngine.canBuild(activePlayer, tileIndex, houseCost, isOwnedGroup)) {
      addLog(`Cannot build house on ${tile.name}! Check group ownership, max houses limit, or funds.`, 'system', activePlayer.name);
      return;
    }

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx !== prev.activePlayerIndex) return p;
        return propertyEngine.buildHouse(p, tileIndex, houseCost);
      });
      return { ...prev, players: updatedPlayers };
    });

    const isHotel = activePlayer.houses[tileIndex] === 4;
    addLog(
      `${activePlayer.name} built a ${isHotel ? 'Hotel' : 'House'} on ${tile.name} for ₹${houseCost}.`,
      'buy',
      activePlayer.name
    );
  }, [activePlayer, ownsFullGroup, addLog]);

  // Mortgage property
  const mortgageProperty = useCallback((tileIndex: number) => {
    const tile = BOARD_TILES[tileIndex];
    const cost = tile.details?.cost || tile.cost || 0;
    const mortgageValue = Math.floor(cost / 2);

    const ownsDeed = activePlayer.properties.includes(tileIndex.toString());
    const housesCount = activePlayer.houses[tileIndex] || 0;

    if (!ruleEngine.canMortgage(activePlayer, tileIndex, ownsDeed, housesCount)) {
      addLog(`Cannot mortgage ${tile.name}! Verify ownership and sell houses first.`, 'system', activePlayer.name);
      return;
    }

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) => {
        if (p.id !== activePlayer.id) return p;
        return propertyEngine.mortgage(p, tileIndex, mortgageValue);
      });
      return { ...prev, players: updatedPlayers };
    });

    addLog(`${activePlayer.name} mortgaged ${tile.name} for ₹${mortgageValue}.`, 'tax', activePlayer.name);
  }, [activePlayer, addLog]);

  // Unmortgage property
  const unmortgageProperty = useCallback((tileIndex: number) => {
    const tile = BOARD_TILES[tileIndex];
    const cost = tile.details?.cost || tile.cost || 0;
    const unmortgageCost = Math.floor(cost * 0.6); // 50% + 10% interest

    if (!ruleEngine.canBuy(activePlayer, unmortgageCost)) {
      addLog(`Need ₹${unmortgageCost} to unmortgage ${tile.name}!`, 'system', activePlayer.name);
      return;
    }

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) => {
        if (p.id !== activePlayer.id) return p;
        return propertyEngine.unmortgage(p, tileIndex, unmortgageCost);
      });
      return { ...prev, players: updatedPlayers };
    });

    addLog(`${activePlayer.name} unmortgaged ${tile.name} for ₹${unmortgageCost}.`, 'buy', activePlayer.name);
  }, [activePlayer, addLog]);

  // Sell house/hotel
  const sellHouse = useCallback((tileIndex: number) => {
    const tile = BOARD_TILES[tileIndex];
    if (!tile.details) return;

    const currentHouses = activePlayer.houses[tileIndex] || 0;
    if (currentHouses === 0) return;

    const refund = Math.floor(tile.details.houseCost / 2);

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) => {
        if (p.id !== activePlayer.id) return p;
        return propertyEngine.sellHouse(p, tileIndex, refund);
      });
      return { ...prev, players: updatedPlayers };
    });

    addLog(
      `${activePlayer.name} sold a ${currentHouses === 5 ? 'Hotel' : 'House'} on ${tile.name} for ₹${refund}.`,
      'tax',
      activePlayer.name
    );
  }, [activePlayer, addLog]);

  // End turn action
  const endTurn = useCallback(() => {
    if (!gameState.isDiceRolled || pendingAction) return;

    const nextIdx = turnEngine.getNextPlayerIndex(gameState.players, gameState.activePlayerIndex);
    const nextPlayer = gameState.players[nextIdx];

    setGameState((prev) => ({
      ...prev,
      activePlayerIndex: nextIdx,
      isDiceRolled: false,
    }));

    addLog(`It is now ${nextPlayer.name}'s turn.`, 'system');
    stateMachine.transitionTo('WAITING_ROLL');
  }, [gameState.isDiceRolled, pendingAction, gameState.players, gameState.activePlayerIndex, addLog]);

  // Update game settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  // Place a bid in property auction
  const bidAuction = useCallback((amount: number) => {
    if (!gameState.auction) return;
    
    const bidderId = gameState.auction.activeBidderIds[gameState.auction.currentBidderIndex];
    const bidderName = gameState.players.find(p => p.id === bidderId)?.name || 'Player';

    if (amount <= gameState.auction.highestBid) {
      addLog(`Bid must be higher than current highest bid of ₹${gameState.auction.highestBid}!`, 'system');
      return;
    }

    const bidder = gameState.players.find(p => p.id === bidderId);
    if (bidder && bidder.money < amount) {
      addLog(`${bidderName} does not have enough cash to bid ₹${amount}!`, 'system');
      return;
    }

    setGameState((prev) => {
      if (!prev.auction) return prev;
      const updatedAuction = propertyEngine.bid(prev.auction, bidderId, amount);
      return {
        ...prev,
        auction: updatedAuction,
      };
    });

    addLog(`${bidderName} bids ₹${amount}.`, 'info');
  }, [gameState.auction, gameState.players, addLog]);

  // Pass bidding in property auction
  const passBid = useCallback(() => {
    if (!gameState.auction) return;

    const bidderId = gameState.auction.activeBidderIds[gameState.auction.currentBidderIndex];
    const bidderName = gameState.players.find(p => p.id === bidderId)?.name || 'Player';

    addLog(`${bidderName} passed the bid.`, 'info');

    setGameState((prev) => {
      if (!prev.auction) return prev;
      
      const updatedAuction = propertyEngine.pass(prev.auction, bidderId);
      
      // Check if auction is completed (1 bidder remains)
      if (updatedAuction.activeBidderIds.length === 1 && updatedAuction.highestBidderId) {
        const winnerId = updatedAuction.highestBidderId;
        const winner = prev.players.find(p => p.id === winnerId);
        const tile = BOARD_TILES[updatedAuction.tileIndex];
        const bidAmount = updatedAuction.highestBid;

        if (winner) {
          const updatedPlayers = prev.players.map((p) => {
            if (p.id !== winnerId) return p;
            return propertyEngine.buy(p, updatedAuction.tileIndex, bidAmount);
          });

          addLog(`${winner.name} won the auction for ${tile.name} at ₹${bidAmount}!`, 'buy');
          
          return {
            ...prev,
            players: updatedPlayers,
            auction: null,
          };
        }
      }

      // Check if all players passed without any bids
      if (updatedAuction.activeBidderIds.length === 0) {
        addLog(`Auction ended. Nobody purchased the property.`, 'info');
        return {
          ...prev,
          auction: null,
        };
      }

      return {
        ...prev,
        auction: updatedAuction,
      };
    });
  }, [gameState.auction, gameState.players, addLog]);

  // Propose Trade
  const proposeTrade = useCallback((proposal: TradeProposal) => {
    setGameState((prev) => ({
      ...prev,
      pendingTrade: proposal,
    }));
    const sender = gameState.players.find(p => p.id === proposal.senderId)?.name || 'Sender';
    const receiver = gameState.players.find(p => p.id === proposal.receiverId)?.name || 'Receiver';
    addLog(`${sender} proposed a property trade to ${receiver}.`, 'info');
  }, [gameState.players, addLog]);

  // Accept Trade
  const acceptTrade = useCallback(() => {
    if (!gameState.pendingTrade) return;
    
    setGameState((prev) => {
      if (!prev.pendingTrade) return prev;
      const updatedPlayers = propertyEngine.executeTrade(prev.players, prev.pendingTrade);
      return {
        ...prev,
        players: updatedPlayers,
        pendingTrade: null,
      };
    });
    addLog(`Trade agreement accepted successfully! Properties swapped.`, 'buy');
  }, [gameState.pendingTrade, addLog]);

  // Decline Trade
  const declineTrade = useCallback(() => {
    if (!gameState.pendingTrade) return;
    
    const receiver = gameState.players.find(p => p.id === gameState.pendingTrade?.receiverId)?.name || 'Player';
    addLog(`${receiver} declined the trade proposal.`, 'info');
    setGameState((prev) => ({
      ...prev,
      pendingTrade: null,
    }));
  }, [gameState.pendingTrade, gameState.players, addLog]);

  return {
    gameState,
    pendingAction,
    diceRolling,
    activePlayer,
    initializeGame,
    rollDice,
    buyProperty,
    declineProperty,
    payRent,
    payTax,
    confirmCardAction,
    declareBankruptcy,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    sellHouse,
    endTurn,
    updateSettings,
    addLog,
    bidAuction,
    passBid,
    proposeTrade,
    acceptTrade,
    declineTrade,
    setGameState,
  };
};
