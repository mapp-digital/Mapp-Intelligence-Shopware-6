// / <reference types="Cypress" />
beforeEach(() => {
  cy.consentMapp();
  cy.interceptTracking();
});

describe("MappIntelligencePluginTests: Wishlist interactions", () => {
  it("wishlist on product detail page", () => {
    cy.fixture("customers").then((customer) => {
      cy.loginAsCustomer(customer.male);
    });
    cy.testTrackRequest();
    cy.testTrackRequest();
    cy.testTrackRequest();
    cy.visit("/MappIntelligence-product-aeoeue/MAPP10001");

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MAPP10001");
      expect(track.co).to.equal("495.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-product-äöü");
      expect(track.st).to.equal("view");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
    });
    cy.contains("Add to wishlist").click();
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MAPP10001");
      expect(track.co).to.equal("495.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-product-äöü");
      expect(track.st).to.equal("add-wl");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
    });

    cy.contains("Remove from wishlist").click();
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MAPP10001");
      expect(track.co).to.equal("495.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-product-äöü");
      expect(track.st).to.equal("del-wl");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
    });
  });
});
