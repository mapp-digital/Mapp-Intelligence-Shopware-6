/**
 * Sometimes SW sets Standard shipment to rule
 * Sunday only. This command shall fix that.
 * (the seed script sets this up front already, this is the fallback during the order test)
 * @memberOf Cypress.Chainable#
 * @name fixShipment
 * @function
 */
Cypress.Commands.add('fixShipment', () => {
    return cy.callAdminApi('post', '/search/rule', {
        filter: [{ type: 'equals', field: 'name', value: 'Cart >= 0' }],
        limit: 1
    }).then((rule) => cy.callAdminApi('post', '/search/shipping-method', {
        filter: [{ type: 'equalsAny', field: 'name', value: ['Standard', 'Express'] }]
    }).then((methods) => {
        [].concat(methods).forEach((method) => {
            cy.callAdminApi('patch', `/shipping-method/${method.id}`, { availabilityRuleId: rule.id });
        });
    }));
});
