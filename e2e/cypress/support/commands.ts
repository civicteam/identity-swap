// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import Loggable = Cypress.Loggable;
import Timeoutable = Cypress.Timeoutable;
import Withinable = Cypress.Withinable;
import Shadow = Cypress.Shadow;

Cypress.Commands.add(
  "getByAttribute",
  (
    attribute: string,
    value: string,
    options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
  ) => cy.get(`[${attribute}=${value}]`, options)
);

Cypress.Commands.add(
  "getByTestId",
  (
    value: string,
    options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
  ) => cy.get(`[data-testid=${value}]`, options)
);
