// / <reference types="Cypress" />

describe('PluginCypressTests: Test configuration', () => {
    beforeEach(() => {
        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/plugin/index/list');
            });
    });

    it('edit plugin\'s configuration', () => {
        // Request we want to wait for later
        cy.server();
        cy.route({
            url: '/api/v1/_action/system-config/batch',
            method: 'post'
        }).as('saveData');

        // Open plugin configuration
        cy.get('.sw-data-grid__row--3 .sw-plugin-table-entry__title')
            .contains('Mapp Intelligence');

        cy.get('.sw-data-grid__row--3').should('be.visible');
        cy.get('.sw-data-grid__row--3 .sw-context-button__button').click({force: true});
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
