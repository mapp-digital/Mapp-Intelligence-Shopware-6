// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Homepage', () => {

    beforeEach(() => {
        cy.visit('/')
    });

    it('no consent -> no tiLoader', () => {
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
});
