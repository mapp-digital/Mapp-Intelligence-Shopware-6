// / <reference types="Cypress" />

describe("MappIntelligencePluginTests: Homepage", () => {
  beforeEach(() => {
    cy.consentMapp();
  });

  it("homepage basic datalayer", () => {
    let data;
    cy.visit("/");
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageName).to.equal("shopware.test/");
        expect(data.pageTitle).to.equal("Catalogue #1");
        expect(data.contentCategory).to.equal("Home");
      });
  });
});
