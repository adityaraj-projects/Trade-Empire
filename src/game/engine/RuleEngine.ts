import { Player } from '../../types/game';

export class RuleEngine {
  canBuy(player: Player, cost: number): boolean {
    return player.money >= cost;
  }

  canBuild(player: Player, tileIndex: number, houseCost: number, ownsFullGroup: boolean): boolean {
    if (!ownsFullGroup) return false;
    const currentHouses = player.houses[tileIndex] || 0;
    if (currentHouses >= 5) return false; // Max houses reached
    return player.money >= houseCost;
  }

  canMortgage(player: Player, tileIndex: number, ownsDeed: boolean, housesCount: number): boolean {
    if (!ownsDeed) return false;
    return housesCount === 0; // Must sell houses first
  }

  canEndTurn(isDiceRolled: boolean, hasPendingAction: boolean): boolean {
    return isDiceRolled && !hasPendingAction;
  }
}

export const ruleEngine = new RuleEngine();
export default ruleEngine;
