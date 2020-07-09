// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Install and Config', () => {
    beforeEach(() => {
        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/plugin/index/list');
            });
    });

    it('install plugin', () => {
        cy.server();
        cy.route({
            url: '/api/v2/search/plugin',
            method: 'post'
        }).as('installPlugin');

        // Open plugin configuration
        cy.get('.sw-data-grid__row--0 .sw-plugin-table-entry__title')
            .contains('Mapp Intelligence');

        cy.get('.sw-data-grid__row--0').should('be.visible');
        cy.get('.sw-data-grid__row--0 .sw-context-button__button').click({force: true});
        cy.get('.sw-context-menu').should('be.visible');
        cy.contains('Install').click();
        cy.get('.sw-context-menu').should('not.exist');

        cy.wait('@installPlugin').then(() => {
            cy.get('.sw-notifications__notification--0 .sw-alert__message').should('be.visible')
                .contains('Plugin has been installed.');
        });
    });

    it('activate plugin', () => {
        cy.server();
        cy.route({
            url: '/api/v2/search/plugin',
            method: 'post'
        }).as('activatePlugin');

        cy.contains('Deactivated').click();
        cy.wait('@activatePlugin').then(() => {
            cy.get('.sw-notifications__notification--0 .sw-alert__message',  {timeout: 120000}).should('be.visible')
                .contains('Plugin has been activated.');
        });
    });

    it('configure plugin', () => {
        cy.server();
        cy.route({
            url: '/api/v1/_action/system-config/batch',
            method: 'post'
        }).as('saveData');

        // Open plugin configuration
        cy.contains('Mapp Intelligence')
            .should('be.visible')
        cy.get('.sw-data-grid__row--0 .sw-context-button__button').click({force: true});

        cy.get('.sw-context-menu').should('be.visible');
        cy.contains('Config').click();
        cy.get('.sw-context-menu').should('not.exist');

        // Edit configuration and save
        cy.get('input[name="MappIntelligence.config.tiId"]').type('136699033798929');
        cy.get('.sw-plugin-config__save-action').click();

        cy.wait('@saveData').then(() => {
            cy.get('.sw-notifications__notification--0 .sw-alert__message').should('be.visible')
                .contains('Configuration has been saved.');
        });
    });
});
