import { GameFlowState } from '../../types/game';
import { eventBus } from './EventBus';

export class StateMachine {
  private currentState: GameFlowState = 'WAITING_ROLL';

  getState(): GameFlowState {
    return this.currentState;
  }

  transitionTo(nextState: GameFlowState) {
    const oldState = this.currentState;
    if (oldState === nextState) return;

    this.currentState = nextState;
    eventBus.emit('STATE_CHANGED', { oldState, nextState });
  }

  reset() {
    this.currentState = 'WAITING_ROLL';
  }
}

export const stateMachine = new StateMachine();
