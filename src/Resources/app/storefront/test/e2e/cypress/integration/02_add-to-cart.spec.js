// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Add-to-Cart', () => {

    beforeEach( () => {
        cy.consentMapp();
    });

    it('activate product overview on startpage', () => {
        let rowNumber;
        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/category/index');
            });
        cy.get('.sw-context-button__button').click();
        cy.contains('Edit').should('be.visible').click();
        cy.contains('Change layout').should('be.visible').click();
        cy.get('div.sw-container > div.sw-cms-layout-modal__content-item')
            .each( (el) => {
                const title = el.find('.sw-cms-list-item__title')[0].innerText;
                if(title === 'Default category layout') {
                    rowNumber = el[0].className.slice(-1);
                }
            })
            .should( () => {
                expect(rowNumber).to.match(/^[0-9]{1,2}$/);
            }).then( () => {
            cy.get(`.sw-cms-layout-modal__content-item.sw-cms-layout-modal__content-item--${rowNumber} input`)
                .check();
            cy.get('.sw-modal__footer > button').eq(1).click();
            cy.get('#modalTitleEl').should('not.be.visible');
            cy.contains('Save').click();
            cy.wait(2000);
        });
    });

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
        cy.contains('Add to shopping cart', {timeout:10000}).click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledTwice;
        });
    });
});
