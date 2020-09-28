/// <reference types="Cypress" />

export abstract class Page {
  private readonly path: string;

  protected constructor(path: string) {
    this.path = path;
  }

  protected invokeAction(action: Record<string, unknown>): this {
    cy.window().its("store").invoke("dispatch", action);
    return this;
  }

  initializeWithNetwork(network: string): this {
    return this.invokeAction({
      type: "wallet/selectCluster",
      payload: network,
    });
  }

  visit(): this {
    cy.visit(this.path);

    return this;
  }
}
