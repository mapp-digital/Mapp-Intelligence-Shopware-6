// / <reference types="Cypress" />

describe('Order tracking', () => {
   it('create promotion / coupon', () => {
       cy.loginViaApi()
           .then(() => {
               cy.visit('/admin#/sw/promotion/create/base');
           });
       cy.get('#sw-field--promotion-name').clear().type('mapp-test-promotion');
       cy.get('input[name=sw-field--promotion-active]').check();
       cy.get('input[placeholder="Add Sales Channel..."')
           .click()
           .wait(300)
           .type('Storefront')
           .wait(500)
           .type('{enter}')
           .wait(500);
       cy.get('input[name=sw-field--promotion-useCodes]').check();
       cy.get('#sw-field--promotion-code').clear().type('mapptest');
       cy.contains('Save').click();
       cy.wait(2000);
       cy.contains('Discounts').click();
       cy.contains('Add discount').should('be.visible').click();
       cy.get('input[placeholder="Enter either a percentage or an absolute value..."]')
           .clear()
           .wait(500)
           .type('10');
       cy.contains('Save').click();
       cy.wait(2000);
       cy.visit('/admin#/sw/promotion/index');
       cy.contains('mapp-test-promotion').should('be.visible');
   });

   it('order testproducts with coupon', () => {
       cy.fixture('customers').then( (customer) => {
           cy.loginAsCustomer(customer.male);
       });

       // add normal product and coupon
       cy.visit('/Mapp-Test-Product-Normael/maeppnormal');
       cy.get('.custom-select.product-detail-quantity-select').select("5");
       cy.contains('Add to shopping cart')
           .should('be.visible')
           .click();
       cy.get('#addPromotionOffcanvasCartInput')
           .should('be.visible')
           .type('mapptest{enter}');
       cy.contains('Code has been added').should('be.visible');

       cy.visit('/Mapp-Test-Product-Variable/mappvariable.1');
       cy.get('.custom-select.product-detail-quantity-select').select("3");
       cy.contains('Add to shopping cart')
           .should('be.visible')
           .click();
       cy.contains('Proceed to checkout')
           .should('be.visible')
           .click();
       cy.get('#tos').check({force: true});
       cy.contains('Send order')
           .should('be.visible')
           .click();
       cy.url().should('match', /checkout\/finish\?orderId=[0-9a-f]{32}$/);
       let data;
       cy.window()
           .then((win) => {
               data = win._ti;
           })
           .then(() => {
               expect(data.pageRequestType).to.not.exist;
               expect(data.contentCategory).to.equal('Checkout');
               expect(data.couponValue).to.equal('800.49');
               expect(data.currency).to.equal('EUR');
               expect(data.customerId).to.match(/^[0-9a-f]{32}$/);
               expect(data.eMailSubscription).to.equal('1');
               expect(data.gender).to.equal('1');
               expect(data.orderId).to.match(/^[0-9]{5}$/);
               expect(data.pageName).to.equal('localhost:8000/checkout/finish');
               expect(data.pageTitle).to.equal('Demostore');
               expect(data.productCategories).to.deep.equal([
                   "Catalogue #1;Catalogue #1",
                   "mapp-test;mapp-test",
                   "mapp-subcategory;mapp-subcategory"
               ]);
               expect(data.productCategory).to.equal('Catalogue #1;Catalogue #1');
               expect(data.productCost).to.equal('999.99;1000.99');
               expect(data.productId).to.equal('mappvariable.1;mäppnormal');
               expect(data.productName).to.equal('Mapp Test Product - Variable;Mapp Test Product - Normäl');
               expect(data.productQuantity).to.equal('3;5');
               expect(data.productShopwareId).to.match(/^[0-9a-f]{32};[0-9a-f]{32}$/);
               expect(data.productSoldOut).to.equal('1;');
               expect(data.productSubCategory).to.equal('mapp-test;mapp-test');
               expect(data.shoppingCartStatus).to.equal('conf');
               expect(data.totalOrderValue).to.equal('7204.43');
           });
   });
});
