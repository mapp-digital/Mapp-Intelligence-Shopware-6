// / <reference types="Cypress" />

describe('Landingpage datalayer', () => {
   it('convert imprint to landingpage', () => {
       let imprintRowNumber;
       const _r = /^Imprint$/;
       cy.server();
       cy.route({
           url: '/api/v2/cms-page/*',
           method: 'patch'
       }).as('updateCMSPage');

       cy.loginViaApi()
           .then(() => {
               cy.visit('/admin#/sw/cms/index');
           });
       cy.get('.sw-cms-list__list-grid-content > div')
           .each( (el) => {
               const title = el.find('.sw-cms-list-item__title')[0].innerText;
                if(_r.test(title)) {
                  imprintRowNumber = el[0].className.slice(-1);
                }
           })
           .should( () => {
                expect(imprintRowNumber).to.match(/^[0-9]{1,2}$/);
       }).then( () => {
           cy.get(`.sw-cms-list-item.sw-cms-list-item--${imprintRowNumber} > div.sw-cms-list-item__image`).click();
       });
       cy.get('button[title=Settings]').click();
       cy.contains('Settings').should('be.visible');
       cy.get('#sw-field--page-type').select('landingpage');
       cy.contains('Save').click();
       cy.wait('@updateCMSPage');
   });

   it('assign Health category to imprint', () => {
       let imprintRowNumber;
       const _r = /^Imprint$/;
       cy.loginViaApi()
           .then(() => {
               cy.visit('/admin#/sw/category/index');
           });
       cy.get('span.sw-icon.icon--small-arrow-small-right.sw-icon--fill').click();
       cy.contains('Health').should('be.visible').click();
       cy.contains('Change layout').should('be.visible').click();
       cy.get('div.sw-container > div.sw-cms-layout-modal__content-item')
           .each( (el) => {
               const title = el.find('.sw-cms-list-item__title')[0].innerText;
               if(_r.test(title)) {
                   imprintRowNumber = el[0].className.slice(-1);
               }
           })
           .should( () => {
               expect(imprintRowNumber).to.match(/^[0-9]{1,2}$/);
           }).then( () => {
               cy.get(`.sw-cms-layout-modal__content-item.sw-cms-layout-modal__content-item--${imprintRowNumber} input`)
                   .check();
               cy.get('.sw-modal__footer > button').eq(1).click();
               cy.get('#modalTitleEl').should('not.be.visible');
               cy.contains('Save').click();
               cy.wait(2000);
       });
   });

   it('datalayer on landingpage', () => {
       cy.visit('/Health/');
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
