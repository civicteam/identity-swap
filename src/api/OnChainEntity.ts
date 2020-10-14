import { head } from "ramda";

export abstract class OnChainEntity {
  readonly lastUpdatedSlot: number;
  protected history: Array<this>;

  protected constructor(currentSlot?: number) {
    this.lastUpdatedSlot = currentSlot || 0;
    this.history = [];
  }

  setPrevious(previous: this): void {
    this.history = [previous, ...previous.history];
  }

  getPrevious(): this | undefined {
    return head(this.history);
  }
}
