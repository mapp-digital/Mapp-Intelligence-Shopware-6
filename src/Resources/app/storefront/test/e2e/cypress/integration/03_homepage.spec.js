// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Homepage', () => {

    beforeEach(() => {
        cy.consentMapp();
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
        let data;
        const func = (d) => {
            data = d;
        };

        cy.window().then((win) => {
            cy.stub(win.wts, 'push', func).as('wts')
        });

        cy.get('.sorting.custom-select')
            .select('price-desc');

        cy.get('@wts')
            .then(() => {
                expect(data[0]).to.equal('send');
                expect(data[1]).to.equal('click');
                expect(data[2].linkId).to.match(/.*sorting.*price.*/ig);
            })
            .and('be.calledOnce');
    });
});
