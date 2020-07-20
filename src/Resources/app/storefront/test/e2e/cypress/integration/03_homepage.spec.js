// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Homepage', () => {

    beforeEach(() => {
        cy.visit('/')
    });

    it('homepage basic datalayer', () => {
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageName).to.equal('localhost:8000/');
                expect(data.pageNumber).to.equal('1');
                expect(data.pageTitle).to.equal('Catalogue #1');
                expect(data.contentCategory).to.equal('Home');
                expect(data.contentSubcategory).to.equal('Product Overview');
            });
    });

    it('switch page', () => {
        cy.get('#p2').click({force: true});
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageName).to.equal('localhost:8000/');
                expect(data.pageNumber).to.equal('2');
                expect(data.pageTitle).to.equal('Catalogue #1');
                expect(data.contentCategory).to.equal('Home');
                expect(data.contentSubcategory).to.equal('Product Overview');
            });
    });

    it('switch sorting', () => {
        cy.window().then((win) => {
            cy.stub(win.wts, 'push').as('wts')
        });

        cy.get('.sorting.custom-select')
            .select('price-desc');

        cy.get('@wts')
            .should('be.calledWith', ['send', 'click', { linkId: 'Sorting: Price, descending' }])
            .and('be.calledOnce');
    });
});
