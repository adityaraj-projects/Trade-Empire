export class AnimationQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  async enqueue(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          await task();
          resolve();
        } catch (err) {
          console.error('Animation Queue Task failed:', err);
          reject(err);
        }
      };

      this.queue.push(wrappedTask);
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessing = false;
  }

  clear() {
    this.queue = [];
    this.isProcessing = false;
  }

  isEmpty(): boolean {
    return this.queue.length === 0 && !this.isProcessing;
  }
}

export const animationQueue = new AnimationQueue();
export default animationQueue;
