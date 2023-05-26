// / <reference types="Cypress" />

describe('Landingpage datalayer', () => {

    beforeEach( () => {
        cy.consentMapp();
    });

   it('datalayer on landingpage', () => {
       cy.visit('/mapp');
       let data;
       cy.window()
           .then((win) => {
               data = win._ti;
           })
           .then(() => {
               expect(data.pageRequestType).to.not.exist;
               expect(data.contentCategory).to.equal('Content');
               expect(data.contentSubcategory).to.equal('Landing Page');
           });
   });
});
