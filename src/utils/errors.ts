export class GeneralError extends Error {
  private internalMessage: string;
  constructor(internalMessage: string) {
    super("notification.error.general");

    this.internalMessage = internalMessage;
  }
}
