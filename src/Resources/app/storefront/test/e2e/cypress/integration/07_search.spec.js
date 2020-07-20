// / <reference types="Cypress" />

describe('Search products', () => {
    it('search testproducts', () => {
        let wts;
        cy.server();
        cy.route({
            url: '/suggest*',
            method: 'get'
        }).as('suggest');

        cy.visit('/');

        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push').as('wts');
        });

        cy.get('input[name=search]').clear().type('map');
        cy.wait('@suggest').then( () => {
            cy.get('@wts')
                .should('be.calledWith', ['linkTrackInstall'])
                .and('be.calledOnce');
        });

        cy.contains('Show all search results').should('be.visible').click();
        cy.url().should('eq', 'http://localhost:8000/search?search=map');

        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Catalogue');
                expect(data.contentSubcategory).to.equal('Internal Search');
                expect(data.internalSearch).to.equal('map');
                expect(data.numberOfSearchResults).to.equal('3');
                expect(data.pageName).to.equal('localhost:8000/search');
                expect(data.pageNumber).to.equal('1');
                expect(data.pageTitle).to.equal('Demostore');
            });
    });
});
