// / <reference types="Cypress" />

beforeEach( () => {
    cy.consentMapp();
});

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
            .get('.sw-select-result')
            .should('be.visible')
            .click({multiple: true});
        cy.get('input[name=sw-field--promotion-useCodes]').check();
        cy.get('#sw-field--promotion-code').clear().type('mapptest');
        cy.contains('Save').click();
        cy.wait(2000);
        cy.contains('Discounts').click();
        cy.wait(2000);
        cy.contains('Add discount').should('be.visible').click();
        cy.wait(2000);
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
        cy.visit('/MappIntelligence-product-aeoeue/MAPP10001');
        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart')
            .should('be.visible')
            .click();
        cy.get('#addPromotionOffcanvasCartInput')
            .should('be.visible')
            .type('mapptest{enter}');
        cy.contains('mapp-test-promotion').should('be.visible');

        cy.visit('/MappIntelligence-Variant-product/SWDEMO10005.1');
        cy.get('.custom-select.product-detail-quantity-select').select("3");
        cy.contains('Add to shopping cart')
            .should('be.visible')
            .click();
        cy.contains('Proceed to checkout')
            .should('be.visible')
            .click();
        cy.get('#tos').check({force: true});
        cy.get('#confirmOrderForm').submit();
        cy.url().should('match', /checkout\/finish\?orderId=[0-9a-f]{32}$/);
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Checkout');
                expect(data.couponValue).to.equal('0.25');
                expect(data.currency).to.equal('EUR');
                expect(data.customerId).to.match(/^[0-9a-f]{32}$/);
                expect(data.eMailSubscription).to.equal('1');
                expect(data.gender).to.equal('1');
                expect(data.orderId).to.match(/^[0-9]{5}$/);
                expect(data.pageName).to.equal('localhost:8000/checkout/finish');
                expect(data.pageTitle).to.equal('Demostore');
                expect(data.productCategory).to.equal('Catalogue #1;Catalogue #1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32};[0-9a-f]{32}$/);
                expect(data.shoppingCartStatus).to.equal('conf');
                expect(data.totalOrderValue).to.equal('2539.47');
                expect(data.productSoldOut).to.equal(';');

                // SW seems to mix the order of line items randomly
                if(data.productId.slice(-2) === '.1') {
                    expect(data.productCost).to.equal('495.95;19.99');
                    expect(data.productId).to.equal('MAPP10001;SWDEMO10005.1');
                    expect(data.productName).to.equal('MappIntelligence product äöü;MappIntelligence Variant product');
                    expect(data.productQuantity).to.equal('5;3');
                    expect(data.productCategories).to.deep.equal(["Catalogue #1;Catalogue #1", "Free time & electronics;Clothing", ";Women"]);
                    expect(data.productSubCategory).to.equal('Free time & electronics;Clothing');
                } else {
                    expect(data.productCost).to.equal('19.99;495.95');
                    expect(data.productId).to.equal('SWDEMO10005.1;MAPP10001');
                    expect(data.productName).to.equal('MappIntelligence Variant product;MappIntelligence product äöü');
                    expect(data.productQuantity).to.equal('3;5');
                    expect(data.productCategories).to.deep.equal(["Catalogue #1;Catalogue #1", "Clothing;Free time & electronics", "Women;"]);
                    expect(data.productSubCategory).to.equal('Clothing;Free time & electronics');
                }
            });
    });
});
