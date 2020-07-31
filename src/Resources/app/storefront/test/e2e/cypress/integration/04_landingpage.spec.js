// / <reference types="Cypress" />

describe('Landingpage datalayer', () => {



   it('datalayer on landingpage', () => {
       cy.wait(5000);
       cy.visit('/mapp-test/');
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
