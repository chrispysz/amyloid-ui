/// <reference types="cypress" />

describe("amyloid home-dashboard", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("redirects to dashboard", () => {
    cy.url().should('include', '/amyloid/dashboard');
  });

  it("displays navbar", () => {
    cy.get(".nav-link").should("have.length", 2);
    cy.get(".nav-link").first().should("have.text", "Dashboard");
    cy.get(".nav-link").last().should("have.text", "Workspaces");
  });

  it("displays dashboard images", () => {
    cy.get("img").should("have.length", 2);
  });
});
