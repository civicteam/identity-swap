/// <reference types="Cypress" />
import { PoolPage } from "./PoolPage";
import { page, setPage } from "./Page";

export class Swap extends PoolPage {
  constructor() {
    super("/swap");
  }
}
