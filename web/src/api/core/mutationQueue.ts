/**
 * Manages client-side concurrency control & burst rate limiting for mutating HTTP requests.
 */
export class MutationQueueManager {
  private activeMutations: number = 0;
  private maxConcurrentMutations: number;
  private mutationQueue: (() => void)[] = [];

  public constructor(maxConcurrentMutations: number = 6) {
    this.maxConcurrentMutations = maxConcurrentMutations;
  }

  public setMaxConcurrentMutations(max: number): void {
    this.maxConcurrentMutations = max;
  }

  public async acquireSlot(): Promise<void> {
    if (this.activeMutations < this.maxConcurrentMutations) {
      this.activeMutations += 1;
      return;
    }

    return new Promise<void>((resolve) => {
      this.mutationQueue.push(() => {
        this.activeMutations += 1;
        resolve();
      });
    });
  }

  public releaseSlot(): void {
    this.activeMutations = Math.max(0, this.activeMutations - 1);
    const next = this.mutationQueue.shift();
    if (next) {
      next();
    }
  }

  public getActiveCount(): number {
    return this.activeMutations;
  }

  public getQueueLength(): number {
    return this.mutationQueue.length;
  }
}
