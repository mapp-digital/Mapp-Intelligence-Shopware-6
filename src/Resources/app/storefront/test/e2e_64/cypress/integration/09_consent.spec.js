// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Cookie Consent Manager', () => {
    it('no consent -> no tiLoader', () => {

        cy.callAdminApi('post', '/_action/system-config/batch', {
            "null":{
                "MappIntelligence.config.blacklist":"",
                "MappIntelligence.config.consent":true,
                "MappIntelligence.config.required":false,
                "MappIntelligence.config.tiId":"136699033798929"
            }
        }).then( () => {
                cy.visit('/');
                cy.window()
                    .then((win) => {
                        expect(win.wts).to.not.exist;
                    });
            });
    });

    it('track request after consent', () => {
        cy.visit('/');
        cy.window()
            .then((win) => {
                expect(win.wts).to.not.exist;
            });
        cy.get('.js-cookie-configuration-button button').click({force:true});
        cy.contains('Mapp Cloud').click();
        cy.wait(2000);
        cy.contains('Save').click();
        cy.wait(2000);
        cy.window()
            .then((win) => {
                expect(win.wts).to.exist;
            });
    });

    it('Deactivate Consent Manager via Plugin Settings', () => {
        cy.callAdminApi('post', '/_action/system-config/batch', {
            "null":{
                "MappIntelligence.config.blacklist":"",
                "MappIntelligence.config.consent":false,
                "MappIntelligence.config.required":false,
                "MappIntelligence.config.tiId":"136699033798929"
            }
        }).then( () => {
            cy.visit('/');
            cy.window()
                .then((win) => {
                    expect(win.wts).to.exist;
                });
            cy.get('.js-cookie-configuration-button button').click({force:true});
            cy.get('.offcanvas-cookie').should('be.visible');
            cy.contains('Mapp Cloud').should('not.be.visible');
        });
    });

    it('Technical required means script runs, listed with checkbox disabled in consent manager', () => {

        cy.callAdminApi('post', '/_action/system-config/batch', {
            "null":{
                "MappIntelligence.config.blacklist":"",
                "MappIntelligence.config.consent":true,
                "MappIntelligence.config.required":true,
                "MappIntelligence.config.tiId":"136699033798929"
            }
        }).then(() => {
            cy.visit('/');
            cy.window()
                .then((win) => {
                    expect(win.wts).to.exist;
                });
            cy.get('.js-cookie-configuration-button button').click({force:true});
            cy.get('.offcanvas-cookie').should('be.visible');
            cy.contains('Mapp Cloud').should('be.visible');
            cy.get('#cookie_sw_MappIntelligence').should('be.disabled');
        });
    });
});
