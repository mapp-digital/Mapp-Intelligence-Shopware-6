// / <reference types="Cypress" />

describe("MappIntelligencePluginTests: Add-to-Cart", () => {
  beforeEach(() => {
    cy.consentMapp();
    cy.interceptTracking();
  });

  it("add-to-cart event", () => {
    cy.visit("/Clothing/");

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("1");
      expect(track.pu).to.equal("http://shopware.test/Clothing/");
    });

    cy.get(".btn.btn-buy").eq(3).click();

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.ba).to.equal("MAPP200010");
      expect(track.co).to.equal("105.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("Catalogue #1");
      expect(track.ca2).to.equal("Clothing");
      expect(track.ca3).to.equal("z_MappIntelligence-product 10");
      expect(track.st).to.equal("view");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("1");
      expect(track.pu).to.equal("http://shopware.test/Clothing/");
      expect(track.cs802).to.equal("4368");
    });

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.ba).to.equal("MAPP200010");
      expect(track.co).to.equal("105.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("Catalogue #1");
      expect(track.ca2).to.equal("Clothing");
      expect(track.ca3).to.equal("z_MappIntelligence-product 10");
      expect(track.st).to.equal("add");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("1");
      expect(track.pu).to.equal("http://shopware.test/Clothing/");
    });
  });
});
