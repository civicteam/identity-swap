/// <reference types="Cypress" />
import { Page } from "./Page";
import Chainable = Cypress.Chainable;

export type FromOrTo = "from" | "to";

export class Swap extends Page {
  constructor() {
    super("/swap");
  }

  getTokenSelector(fromOrTo: FromOrTo): Chainable {
    return cy
      .getByTestId("SWAP_TOKEN_SELECTOR_" + fromOrTo.toUpperCase())
      .get("select");
  }
}
