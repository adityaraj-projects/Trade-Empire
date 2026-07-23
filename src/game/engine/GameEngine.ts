import { diceEngine } from './DiceEngine';
import { turnEngine } from './TurnEngine';
import { movementEngine } from './MovementEngine';
import { animationQueue } from './AnimationQueue';
import { stateMachine } from './StateMachine';
import { eventBus } from './EventBus';
import { bankEngine } from './BankEngine';
import { propertyEngine } from './PropertyEngine';
import { cardEngine } from './CardEngine';
import { ruleEngine } from './RuleEngine';
import { replayLogger } from './ReplayLogger';
import { gameSnapshot } from './GameSnapshot';

export const GameEngine = {
  dice: diceEngine,
  turn: turnEngine,
  movement: movementEngine,
  queue: animationQueue,
  state: stateMachine,
  bus: eventBus,
  bank: bankEngine,
  property: propertyEngine,
  card: cardEngine,
  rule: ruleEngine,
  logger: replayLogger,
  snapshot: gameSnapshot,
};

export default GameEngine;
