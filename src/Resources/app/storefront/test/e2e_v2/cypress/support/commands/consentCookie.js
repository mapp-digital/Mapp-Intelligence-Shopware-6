/**
 * Sets consent cookie for MappIntelligence
 * @memberOf Cypress.Chainable#
 * @name consentMapp
 * @function
 */
Cypress.Commands.add('consentMapp', () => {
    cy.setCookie('sw_MappIntelligence', '1');
});
