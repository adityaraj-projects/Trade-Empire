import { GameLog } from '../../types/game';

export class ReplayLogger {
  private static createLog(message: string, type: GameLog['type'], playerName?: string): GameLog {
    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type,
      playerName,
    };
  }

  logRoll(playerName: string, dice: [number, number]): GameLog {
    const diceSum = dice[0] + dice[1];
    return ReplayLogger.createLog(
      `${playerName} rolled ${dice[0]} & ${dice[1]} (Total: ${diceSum}).`,
      'roll',
      playerName
    );
  }

  logSalary(playerName: string, amount: number): GameLog {
    return ReplayLogger.createLog(
      `${playerName} passed START and collected ₹${amount} salary.`,
      'tax',
      playerName
    );
  }

  logLand(playerName: string, tileName: string): GameLog {
    return ReplayLogger.createLog(`${playerName} landed on ${tileName}.`, 'info', playerName);
  }

  logPurchase(playerName: string, propertyName: string, price: number): GameLog {
    return ReplayLogger.createLog(
      `${playerName} bought ${propertyName} for ₹${price}.`,
      'buy',
      playerName
    );
  }

  logRent(senderName: string, recipientName: string, amount: number): GameLog {
    return ReplayLogger.createLog(
      `${senderName} paid ₹${amount} rent to ${recipientName}.`,
      'rent',
      senderName
    );
  }

  logTax(playerName: string, amount: number, tileName: string): GameLog {
    return ReplayLogger.createLog(
      `${playerName} paid ₹${amount} tax on ${tileName}.`,
      'tax',
      playerName
    );
  }

  logJailRelease(playerName: string, method: string): GameLog {
    return ReplayLogger.createLog(
      `${playerName} was released from Jail via ${method}.`,
      'jail',
      playerName
    );
  }

  logJailStay(playerName: string, turns: number): GameLog {
    return ReplayLogger.createLog(
      `${playerName} remains in jail (Turn ${turns}/3).`,
      'jail',
      playerName
    );
  }

  logJailSent(playerName: string): GameLog {
    return ReplayLogger.createLog(
      `${playerName} was sent directly to Jail!`,
      'jail',
      playerName
    );
  }
}

export const replayLogger = new ReplayLogger();
export default replayLogger;
