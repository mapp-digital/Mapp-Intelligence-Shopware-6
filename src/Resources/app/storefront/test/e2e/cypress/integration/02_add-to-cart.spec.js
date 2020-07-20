// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Add-to-Cart', () => {

    it('datalayer during add-to-cart event', () => {
        let wts;

        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/');

        cy.window().then((win) => {
            let calls = 0;
            wts = cy.stub(win.wts, 'push', () => {
                expect(win._ti.pageRequestType).to.equal('virtual');
                expect(win._ti.shoppingCartStatus).to.equal(calls === 0 ? 'view': 'add');
                calls++;
            }).as('wts');
        });
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledTwice;
        });
    });
});
