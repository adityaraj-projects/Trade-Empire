import { Player, GameCard } from '../../types/game';
import { bankEngine } from './BankEngine';
import { eventBus } from './EventBus';

export class CardEngine {
  drawCard(deck: GameCard[]): GameCard {
    const randomCard = deck[Math.floor(Math.random() * deck.length)];
    eventBus.emit('CARD_DRAWN', { card: randomCard });
    return randomCard;
  }

  executeCard(player: Player, card: GameCard): { player: Player; moneyChange: number; newPosition?: number } {
    let moneyChange = 0;
    let newPosition: number | undefined;
    let updatedPlayer = { ...player };

    if (card.action === 'money') {
      moneyChange = Number(card.value);
      if (moneyChange > 0) {
        updatedPlayer = bankEngine.deposit(updatedPlayer, moneyChange);
      } else if (moneyChange < 0) {
        updatedPlayer = bankEngine.withdraw(updatedPlayer, Math.abs(moneyChange));
      }
    } else if (card.action === 'move') {
      newPosition = Number(card.value);
    } else if (card.action === 'jail') {
      newPosition = 10; // Jail index
      updatedPlayer.inJail = true;
      updatedPlayer.jailTurns = 0;
      eventBus.emit('PLAYER_SENT_TO_JAIL', { player: player.name });
    }

    return { player: updatedPlayer, moneyChange, newPosition };
  }
}

export const cardEngine = new CardEngine();
export default cardEngine;
