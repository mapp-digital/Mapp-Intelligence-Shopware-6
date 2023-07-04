// / <reference types="Cypress" />

beforeEach(() => {
  cy.consentMapp();
});

describe("Search products", () => {
  let wts;
  it("search testproducts", () => {
    cy.intercept({
      url: "/suggest*",
      method: "get",
    }).as("suggest");

    cy.visit("/");

    cy.window().then((win) => {
      wts = cy.stub(win.wts, "push").as("wts");
    });

    cy.get("input[name=search]").clear().type("Map").wait("@suggest");
    cy.get("input[name=search]").type("p").wait("@suggest");
    cy.get("input[name=search]").type("I").wait("@suggest");
    cy.get("input[name=search]").type("n").wait("@suggest");
    cy.get("input[name=search]").type("t").wait("@suggest");
    cy.get("input[name=search]").type("e").wait("@suggest");
    cy.get("input[name=search]").type("l").wait("@suggest");
    cy.get("input[name=search]").type("l").wait("@suggest");
    cy.get("input[name=search]").type("i").wait("@suggest");
    cy.get("input[name=search]").type("g").wait("@suggest");
    cy.get("input[name=search]").type("e").wait("@suggest");
    cy.get("input[name=search]").type("n").wait("@suggest");
    cy.get("input[name=search]").type("c").wait("@suggest");
    cy.get("input[name=search]")
      .type("e")
      .wait("@suggest")
      .then(() => {
        cy.get("@wts")
          .should("be.always.calledWithMatch", ["linkTrackInstall"])
          .and("have.callCount", 14);
      });

    cy.contains("Show all search results").should("be.visible").click();
    cy.url().should(
      "eq",
      "http://shopware.test/search?search=MappIntelligence"
    );

    let data;
    cy.window()
      .then((win) => {
        data = win._ti;
      })
      .then(() => {
        expect(data.pageRequestType).to.not.exist;
        expect(data.contentCategory).to.equal("Catalogue");
        expect(data.contentSubcategory).to.equal("Internal Search");
        expect(data.internalSearch).to.equal("MappIntelligence");
        expect(data.numberOfSearchResults).to.equal("3");
        expect(data.pageName).to.equal("shopware.test/search");
        expect(data.pageNumber).to.equal("1");
        expect(data.pageTitle).to.equal("Demostore");
      });
  });
});
