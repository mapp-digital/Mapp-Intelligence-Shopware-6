// / <reference types="Cypress" />

beforeEach(() => {
  cy.consentMapp();
  cy.interceptTracking();
});

describe("Product detail datalayer", () => {
  it("normal product: view", () => {
    cy.visit("/MappIntelligence-product-aeoeue/MAPP10001");
    let data;
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
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageRequestType).to.not.exist;
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Detail");
        expect(data.currency).to.equal("EUR");
        expect(data.pageName).to.equal(
          "shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
        );
        expect(data.pageTitle).to.equal(
          "MappIntelligence-product-äöü | MAPP10001"
        );
        expect(data.productCategories).to.deep.equal([
          "MappTestProducts",
          "MappSubCategory",
        ]);
        expect(data.productCategory).to.equal("MappTestProducts");
        expect(data.productCost).to.equal("495.95");
        expect(data.productId).to.equal("MAPP10001");
        expect(data.productName).to.equal("MappIntelligence-product-äöü");
        expect(data.productQuantity).to.equal("1");
        expect(data.productShopwareId).to.equal(
          "222aee2d4ef6484f99e541a03976d867"
        );
        expect(data.productSoldOut).to.equal("");
        expect(data.productSubCategory).to.equal("MappSubCategory");
        expect(data.shoppingCartStatus).to.equal("view");
      });
  });

  it("normal product: multiple add to cart", () => {
    let wts;
    let data;

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

    cy.get(".js-quantity-selector").clear().type("5");
    cy.get(".btn-buy").click();

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MAPP10001");
      expect(track.co).to.equal("2479.75");
      expect(track.qn).to.equal("5");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-product-äöü");
      expect(track.st).to.equal("add");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-product-aeoeue/MAPP10001"
      );
    });
  });

  it("soldout product: view", () => {
    cy.visit("/MappIntelligence-product-soldout/MAPP100013");
    let data;
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageRequestType).to.not.exist;
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Detail");
        expect(data.currency).to.equal("EUR");
        expect(data.pageName).to.equal(
          "shopware.test/MappIntelligence-product-soldout/MAPP100013"
        );
        expect(data.pageTitle).to.equal(
          "MappIntelligence-product-soldout | MAPP100013"
        );
        expect(data.productCategories).to.deep.equal([
          "MappTestProducts",
          "MappSubCategory",
        ]);
        expect(data.productCategory).to.equal("MappTestProducts");
        expect(data.productCost).to.equal("1.99");
        expect(data.productId).to.equal("MAPP100013");
        expect(data.productName).to.equal("MappIntelligence-product-soldout");
        expect(data.productQuantity).to.equal("1");
        expect(data.productShopwareId).to.equal(
          "333aee2d4ef6484f99e541a03976d867"
        );
        expect(data.productSoldOut).to.equal("1");
        expect(data.productSubCategory).to.equal("MappSubCategory");
        expect(data.shoppingCartStatus).to.equal("view");
      });
  });

  it("soldout product: multiple add to cart", () => {
    cy.visit("/MappIntelligence-product-soldout/MAPP100013");

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-product-soldout/MAPP100013"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MAPP100013");
      expect(track.co).to.equal("1.99");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-product-soldout");
      expect(track.st).to.equal("view");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-product-soldout/MAPP100013"
      );
    });

    cy.get(".js-quantity-selector").clear().type("5");
    cy.contains("Add to shopping cart").click();

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-product-soldout/MAPP100013"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MAPP100013");
      expect(track.co).to.equal("9.95");
      expect(track.qn).to.equal("5");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-product-soldout");
      expect(track.st).to.equal("add");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-product-soldout/MAPP100013"
      );
    });
  });

  it("variable product: view, then switch", () => {
    cy.visit(
      "/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Red"
    );
    cy.window().its("wts.push").should("exist");
    let data;
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageRequestType).to.not.exist;
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Detail");
        expect(data.currency).to.equal("EUR");
        expect(data.pageName).to.equal(
          "shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Red"
        );
        expect(data.pageTitle).to.equal(
          "MappIntelligence-Variant-product | Red | MappIntelligence-Variant-product-Red"
        );
        expect(data.productCategories).to.deep.equal([
          "MappTestProducts",
          "MappSubCategory",
        ]);
        expect(data.productCategory).to.equal("MappTestProducts");
        expect(data.productCost).to.equal("295.95");
        expect(data.productId).to.equal("MappIntelligence-Variant-product-Red");
        expect(data.productName).to.equal("MappIntelligence-Variant-product");
        expect(data.productQuantity).to.equal("1");
        expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
        expect(data.productSoldOut).to.equal("");
        expect(data.productSubCategory).to.equal("MappSubCategory");
        expect(data.shoppingCartStatus).to.equal("view");
      });

    cy.get(".product-detail-configurator-option input")
      .eq(0)
      .click({ force: true });
    cy.contains("MappIntelligence-Variant-product-Blue").should("be.visible");
    cy.window().its("wts.push").should("exist");
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageRequestType).to.not.exist;
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Product Detail");
        expect(data.currency).to.equal("EUR");
        expect(data.pageName).to.equal(
          "shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Blue"
        );
        expect(data.pageTitle).to.equal(
          "MappIntelligence-Variant-product | Blue | MappIntelligence-Variant-product-Blue"
        );
        expect(data.productCategories).to.deep.equal([
          "MappTestProducts",
          "MappSubCategory",
        ]);
        expect(data.productCategory).to.equal("MappTestProducts");
        expect(data.productCost).to.equal("295.95");
        expect(data.productId).to.equal(
          "MappIntelligence-Variant-product-Blue"
        );
        expect(data.productName).to.equal("MappIntelligence-Variant-product");
        expect(data.productQuantity).to.equal("1");
        expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
        expect(data.productSoldOut).to.equal("");
        expect(data.productSubCategory).to.equal("MappSubCategory");
        expect(data.shoppingCartStatus).to.equal("view");
      });
  });

  it("variable product: switch, then multiple add to cart", () => {
    cy.visit(
      "/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Red"
    );
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Red"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MappIntelligence-Variant-product-Red");
      expect(track.co).to.equal("295.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-Variant-product");
      expect(track.st).to.equal("view");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Red"
      );
    });
    cy.window().its("wts.push").should("exist");
    cy.get(".product-detail-configurator-option input")
      .eq(0)
      .click({ force: true });
    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Blue"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MappIntelligence-Variant-product-Blue");
      expect(track.co).to.equal("295.95");
      expect(track.qn).to.equal("1");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-Variant-product");
      expect(track.st).to.equal("view");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Blue"
      );
    });
    cy.contains("MappIntelligence-Variant-product-Blue").should("be.visible");

    cy.get(".js-quantity-selector").clear().type("5");
    cy.contains("Add to shopping cart").click();

    cy.testTrackRequest().then((track) => {
      expect(track.pageName).to.equal(
        "shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Blue"
      );
      expect(track.cr).to.equal("EUR");
      expect(track.ba).to.equal("MappIntelligence-Variant-product-Blue");
      expect(track.co).to.equal("1479.75");
      expect(track.qn).to.equal("5");
      expect(track.ca1).to.equal("MappTestProducts");
      expect(track.ca2).to.equal("MappSubCategory");
      expect(track.ca3).to.equal("MappIntelligence-Variant-product");
      expect(track.st).to.equal("add");
      expect(track.cg1).to.equal("Catalogue");
      expect(track.cg2).to.equal("Product Detail");
      expect(track.pu).to.equal(
        "http://shopware.test/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Blue"
      );
    });
  });
});
