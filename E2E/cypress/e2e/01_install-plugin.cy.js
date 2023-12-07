// / <reference types="Cypress" />

describe("MappIntelligencePluginTests: Install and Config", () => {
  it("configure, check _tiConfig, wts and blacklist", () => {
    cy.consentMapp();
    let config;
    let data;

    cy.callAdminApi("post", "_action/system-config/batch", {
      null: {
        "MappIntelligence.config.blacklist": "pageName,pageTitle",
        "MappIntelligence.config.consent": true,
        "MappIntelligence.config.required": false,
        "MappIntelligence.config.tiId": "136699033798929",
        "core.cart.wishlistEnabled": true
      },
    }).then(() => {
      cy.visit("/");
      cy.window()
        .then((win) => {
          config = win._tiConfig;
          data = win._ti;
          return win;
        })
        .then((win) => {
          expect(config.tiId).to.equal("136699033798929");
          expect(win.wts).to.exist;
          expect(data).to.exist;
          expect(data.pageName).to.not.exist;
          expect(data.pageTitle).to.not.exist;
        });
    });
  });

  it("deactivate blacklist", () => {
    cy.consentMapp();
    let data;
    cy.callAdminApi("post", "/_action/system-config/batch", {
      null: {
        "MappIntelligence.config.blacklist": "",
        "MappIntelligence.config.consent": true,
        "MappIntelligence.config.required": false,
        "MappIntelligence.config.tiId": "136699033798929",
      },
    }).then(() => {
      cy.visit("/");
      cy.window()
        .then((win) => {
          data = win._ti;
        })
        .then(() => {
          expect(data).to.exist;
          expect(data.pageName).to.exist;
          expect(data.pageTitle).to.exist;
        });
    });
  });
});
