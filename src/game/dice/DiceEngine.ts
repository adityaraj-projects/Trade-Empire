export class DiceEngine {
  private doubleCount = 0;

  roll(): [number, number] {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    
    if (d1 === d2) {
      this.doubleCount++;
    } else {
      this.doubleCount = 0;
    }

    return [d1, d2];
  }

  isDouble(dice: [number, number]): boolean {
    return dice[0] === dice[1];
  }

  hasTripleDouble(): boolean {
    return this.doubleCount >= 3;
  }

  resetDoubleCount() {
    this.doubleCount = 0;
  }

  getDoubleCount(): number {
    return this.doubleCount;
  }
}

export const diceEngine = new DiceEngine();
export default diceEngine;
