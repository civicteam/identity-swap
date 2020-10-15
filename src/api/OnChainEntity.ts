import { head } from "ramda";

export abstract class OnChainEntity<T extends OnChainEntity<T>> {
  readonly lastUpdatedSlot: number;
  protected history: Array<T>;

  protected constructor(currentSlot?: number, history?: Array<T>) {
    this.lastUpdatedSlot = currentSlot || 0;
    this.history = history || [];
  }

  setPrevious(previous: T): void {
    this.history = [previous, ...previous.history];
  }

  getPrevious(): T | undefined {
    return head(this.history);
  }
}
