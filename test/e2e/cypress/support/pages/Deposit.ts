/// <reference types="Cypress" />
import { PoolPage } from "./PoolPage";

export class Deposit extends PoolPage {
  constructor() {
    super("/deposit");
  }
}
