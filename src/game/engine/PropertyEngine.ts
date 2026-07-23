import { Player, AuctionState, TradeProposal } from '../../types/game';
import { bankEngine } from './BankEngine';
import { eventBus } from './EventBus';

export class PropertyEngine {
  buy(player: Player, tileIndex: number, cost: number): Player {
    const playerWithProperty = {
      ...player,
      properties: [...player.properties, tileIndex.toString()],
    };
    const updated = bankEngine.withdraw(playerWithProperty, cost);
    eventBus.emit('PROPERTY_BOUGHT', { player: player.name, tileIndex, cost });
    return updated;
  }

  mortgage(player: Player, tileIndex: number, refund: number): Player {
    const tileStr = tileIndex.toString();
    const newProperties = player.properties.map(p => (p === tileStr ? `${tileIndex}m` : p));
    
    const playerWithMortgage = {
      ...player,
      properties: newProperties,
    };
    const updated = bankEngine.deposit(playerWithMortgage, refund);
    eventBus.emit('PROPERTY_MORTGAGED', { player: player.name, tileIndex, refund });
    return updated;
  }

  unmortgage(player: Player, tileIndex: number, cost: number): Player {
    const mortStr = `${tileIndex}m`;
    const newProperties = player.properties.map(p => (p === mortStr ? tileIndex.toString() : p));
    
    const playerWithUnmortgage = {
      ...player,
      properties: newProperties,
    };
    const updated = bankEngine.withdraw(playerWithUnmortgage, cost);
    eventBus.emit('PROPERTY_UNMORTGAGED', { player: player.name, tileIndex, cost });
    return updated;
  }

  buildHouse(player: Player, tileIndex: number, cost: number): Player {
    const currentHouses = player.houses[tileIndex] || 0;
    const newHouses = { ...player.houses, [tileIndex]: currentHouses + 1 };
    
    const playerWithHouse = {
      ...player,
      houses: newHouses,
    };
    const updated = bankEngine.withdraw(playerWithHouse, cost);
    eventBus.emit('HOUSE_BUILT', { player: player.name, tileIndex, cost, houseCount: currentHouses + 1 });
    return updated;
  }

  sellHouse(player: Player, tileIndex: number, refund: number): Player {
    const currentHouses = player.houses[tileIndex] || 0;
    const newHouses = { ...player.houses };
    
    if (currentHouses <= 1) {
      delete newHouses[tileIndex];
    } else {
      newHouses[tileIndex] = currentHouses - 1;
    }

    const playerWithLessHouses = {
      ...player,
      houses: newHouses,
    };
    const updated = bankEngine.deposit(playerWithLessHouses, refund);
    eventBus.emit('HOUSE_SOLD', { player: player.name, tileIndex, refund, houseCount: currentHouses - 1 });
    return updated;
  }

  // PROPERTY AUCTIONS
  startAuction(tileIndex: number, players: Player[], activePlayerIndex: number): AuctionState {
    const activeBidderIds = players.filter(p => !p.isBankrupt).map(p => p.id);
    // Point current bidder index to active player's index or next in line
    const activePlayerId = players[activePlayerIndex].id;
    let initialBidderIndex = activeBidderIds.indexOf(activePlayerId);
    if (initialBidderIndex === -1) initialBidderIndex = 0;

    return {
      tileIndex,
      highestBid: 0,
      highestBidderId: null,
      activeBidderIds,
      currentBidderIndex: initialBidderIndex,
    };
  }

  bid(auction: AuctionState, bidderId: string, amount: number): AuctionState {
    const nextIndex = (auction.currentBidderIndex + 1) % auction.activeBidderIds.length;
    return {
      ...auction,
      highestBid: amount,
      highestBidderId: bidderId,
      currentBidderIndex: nextIndex,
    };
  }

  pass(auction: AuctionState, bidderId: string): AuctionState {
    const updatedBidders = auction.activeBidderIds.filter(id => id !== bidderId);
    let nextIndex = auction.currentBidderIndex;
    if (nextIndex >= updatedBidders.length) {
      nextIndex = 0;
    }
    return {
      ...auction,
      activeBidderIds: updatedBidders,
      currentBidderIndex: nextIndex,
    };
  }

  // PROPERTY TRADES
  executeTrade(players: Player[], proposal: TradeProposal): Player[] {
    return players.map((p) => {
      if (p.id === proposal.senderId) {
        // Remove offered properties, add requested properties, adjust cash
        const propertiesFiltered = p.properties.filter(
          id => !proposal.offeredProperties.map(String).includes(id)
        );
        const propertiesAdded = [
          ...propertiesFiltered,
          ...proposal.requestedProperties.map(String)
        ];
        
        return {
          ...p,
          money: p.money - proposal.offeredCash + proposal.requestedCash,
          properties: propertiesAdded,
        };
      }
      
      if (p.id === proposal.receiverId) {
        // Add offered properties, remove requested properties, adjust cash
        const propertiesFiltered = p.properties.filter(
          id => !proposal.requestedProperties.map(String).includes(id)
        );
        const propertiesAdded = [
          ...propertiesFiltered,
          ...proposal.offeredProperties.map(String)
        ];
        
        return {
          ...p,
          money: p.money + proposal.offeredCash - proposal.requestedCash,
          properties: propertiesAdded,
        };
      }
      
      return p;
    });
  }
}

export const propertyEngine = new PropertyEngine();
export default propertyEngine;
