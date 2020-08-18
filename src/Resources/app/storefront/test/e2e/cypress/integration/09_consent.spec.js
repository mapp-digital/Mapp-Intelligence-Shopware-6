// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Cookie Consent Manager', () => {
    it('no consent -> no tiLoader', () => {
        cy.visit('/');
        cy.window()
            .then((win) => {
                expect(win.wts).to.not.exist;
            });
    });

    it('track request after consent', () => {
         cy.visit('/');
        cy.window()
            .then((win) => {
                expect(win.wts).to.not.exist;
            });
        cy.get('.js-cookie-configuration-button button').click({force:true});
        cy.contains('Mapp Intelligence').click();
        cy.contains('Save').click();
        cy.window()
            .then((win) => {
                expect(win.wts).to.exist;
            });
    });

    it('Deactivate Consent Manager via Plugin Settings', () => {
        cy.server();
        cy.route({
            url: '/api/v*/_action/system-config/batch',
            method: 'post'
        }).as('saveData');

        // cy.loginViaApi()
        //     .then(() => {
        //         cy.visit('/admin#/sw/plugin/settings/MappIntelligence');
        //     });
        // cy.contains('List Mapp Intelligence in Shopware 6 Cookie Consent Manager').click();
        // cy.get('.sw-field--checkbox__content input[type=checkbox]').check();
        // cy.get('.sw-plugin-config__save-action').click();
        // cy.wait('@saveData');

        cy.visit('/');
        cy.window()
            .then((win) => {
                expect(win.wts).to.not.exist;
            });
        cy.get('.js-cookie-configuration-button button').click({force:true});
        cy.get('.offcanvas-cookie').should('be.visible');
        cy.contains('Mapp Intelligence').should('be.visible');

        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/plugin/settings/MappIntelligence');
            });
        cy.contains('List Mapp Intelligence in Shopware 6 Cookie Consent Manager').click();
        cy.get('.sw-field--checkbox__content input[type=checkbox]').uncheck();
        cy.get('.sw-plugin-config__save-action').click();
        cy.wait('@saveData');
        cy.visit('/');
        cy.window()
            .then((win) => {
                expect(win.wts).to.exist;
            });
        cy.get('.js-cookie-configuration-button button').click({force:true});
        cy.get('.offcanvas-cookie').should('be.visible');
        cy.contains('Mapp Intelligence').should('not.be.visible');
    });
});
