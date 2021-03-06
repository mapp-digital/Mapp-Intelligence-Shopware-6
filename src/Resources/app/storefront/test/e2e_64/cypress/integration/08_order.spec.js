// / <reference types="Cypress" />

beforeEach( () => {
    cy.consentMapp();
});

describe('Order tracking', () => {

    it('order testproducts with coupon',{
            env: {
                apiVersion: 'v2'
            }
        }, () => {
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
        cy.contains('MappCoupon').should('be.visible');

        cy.visit('/MappIntelligence-Variant-product/MappIntelligence-Variant-product-azure');
        cy.get('.custom-select.product-detail-quantity-select').select("3");
        cy.contains('Add to shopping cart')
            .should('be.visible')
            .click();
        cy.contains('Proceed to checkout')
            .should('be.visible')
            .click();
        cy.get('#tos').check({force: true}).then(() => {
            // sometimes SW6 sets the shipment rule sunday-only for standard shipment. Then the order won't work.
            if(Cypress.$('.alert').length === 1) {
                cy.fixShipment().then(() => {
                    cy.wait(1000);
                    cy.visit('/checkout/confirm');
                    cy.get('#tos').check({force: true});
                    cy.get('#confirmOrderForm').submit();
                });
            } else {
                cy.get('#confirmOrderForm').submit();
            }
            cy.url().should('match', /checkout\/finish\?orderId=[0-9a-f]{32}$/);
            let data;
            cy.window()
                .then((win) => {
                    data = win._ti;
                })
                .then(() => {
                    expect(data.pageRequestType).to.not.exist;
                    expect(data.contentCategory).to.equal('Checkout');
                    expect(data.couponValue).to.equal('3');
                    expect(data.currency).to.equal('EUR');
                    expect(data.customerId).to.match(/^[0-9a-f]{32}$/);
                    expect(data.eMailSubscription).to.equal('1');
                    expect(data.gender).to.equal('1');
                    expect(data.orderId).to.match(/^[0-9]{5}$/);
                    expect(data.pageName).to.equal('localhost:8000/checkout/finish');
                    expect(data.pageTitle).to.equal('Demostore');
                    expect(data.productCategory).to.equal('MappTestProducts;MappTestProducts');
                    expect(data.productShopwareId).to.match(/^[0-9a-f]{32};[0-9a-f]{32}$/);
                    expect(data.shoppingCartStatus).to.equal('conf');
                    expect(data.totalOrderValue).to.equal('3364.6');
                    expect(data.productSoldOut).to.equal(';');
                    expect(data.productCategories).to.deep.equal(["MappTestProducts;MappTestProducts", "MappSubCategory;MappSubCategory"]);
                    expect(data.productSubCategory).to.equal('MappSubCategory;MappSubCategory');

                    // SW seems to mix the order of line items randomly
                    if(data.productId.slice(-2) === 're') {
                        expect(data.productCost).to.equal('495.95;295.95');
                        expect(data.productId).to.equal('MAPP10001;MappIntelligence-Variant-product-azure');
                        expect(data.productName).to.equal('MappIntelligence-product-äöü;MappIntelligence-Variant-product');
                        expect(data.productQuantity).to.equal('5;3');
                    } else {
                        expect(data.productCost).to.equal('295.95;495.95');
                        expect(data.productId).to.equal('MappIntelligence-Variant-product-azure;MAPP10001');
                        expect(data.productName).to.equal('MappIntelligence-Variant-product;MappIntelligence-product-äöü');
                        expect(data.productQuantity).to.equal('3;5');
                    }
                });
        });
    });
});
