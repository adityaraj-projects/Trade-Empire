import { Player } from '../../types/game';
import { eventBus } from './EventBus';

export class BankEngine {
  deposit(player: Player, amount: number): Player {
    const updated = { ...player, money: player.money + amount };
    eventBus.emit('BANK_DEPOSIT', { player: player.name, amount });
    return updated;
  }

  withdraw(player: Player, amount: number): Player {
    const updated = { ...player, money: player.money - amount };
    eventBus.emit('BANK_WITHDRAW', { player: player.name, amount });
    return updated;
  }

  transfer(sender: Player, recipient: Player, amount: number): { sender: Player; recipient: Player } {
    const updatedSender = { ...sender, money: sender.money - amount };
    const updatedRecipient = { ...recipient, money: recipient.money + amount };
    
    eventBus.emit('BANK_TRANSFER', {
      sender: sender.name,
      recipient: recipient.name,
      amount,
    });

    return { sender: updatedSender, recipient: updatedRecipient };
  }

  salary(player: Player, amount: number): Player {
    const updated = this.deposit(player, amount);
    eventBus.emit('COLLECT_SALARY', { player: player.name, amount });
    return updated;
  }

  tax(player: Player, amount: number): Player {
    const updated = this.withdraw(player, amount);
    eventBus.emit('PAY_TAX', { player: player.name, amount });
    return updated;
  }
}

export const bankEngine = new BankEngine();
export default bankEngine;
