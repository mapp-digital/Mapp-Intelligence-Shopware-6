// / <reference types="Cypress" />

describe("MappIntelligencePluginTests: Homepage", () => {
  beforeEach(() => {
    cy.consentMapp();
    cy.interceptTracking();
  });

  it("catalog basic datalayer", () => {
    let data;
    cy.visit("/Clothing/");
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("1");
      expect(track.pu).to.equal("http://shopware.test/Clothing/");
    });
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageName).to.equal("shopware.test/Clothing/");
        expect(data.pageTitle).to.equal("Clothing");
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Overview");
        expect(data.pageNumber).to.equal("1");
      });
  });

  it("switch page", () => {
    let data;
    cy.visit("/Clothing/");
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("1");
      expect(track.pu).to.equal("http://shopware.test/Clothing/");
    });
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageName).to.equal("shopware.test/Clothing/");
        expect(data.pageTitle).to.equal("Clothing");
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Overview");
        expect(data.pageNumber).to.equal("1");
      });
    cy.get("#p2").click({ force: true });
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("2");
      expect(track.pu).to.equal(
        "http://shopware.test/Clothing/?order=name-asc&p=2"
      );
    });
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageName).to.equal("shopware.test/Clothing/");
        expect(data.pageTitle).to.equal("Clothing");
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Overview");
        expect(data.pageNumber).to.equal("2");
      });
  });

  it("switch sorting", () => {
    let data;
    cy.visit("/Clothing/");
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Overview");
      expect(track.cg20).to.equal("1");
      expect(track.pu).to.equal("http://shopware.test/Clothing/");
    });
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageName).to.equal("shopware.test/Clothing/");
        expect(data.pageTitle).to.equal("Clothing");
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Overview");
        expect(data.pageNumber).to.equal("1");
      });
    cy.get(".sorting.form-select").select("price-desc");
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal("shopware.test/Clothing/");
      expect(track.ct).to.equal("Sorting: Price descending");
      expect(track.pu).to.equal(
        "http://shopware.test/Clothing/?order=price-desc&p=1"
      );
    });
  });
});
