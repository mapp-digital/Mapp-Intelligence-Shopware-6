// / <reference types="Cypress" />

beforeEach( () => {
    cy.consentMapp();
});

describe('Product detail datalayer', () => {

    it('normal product: view', () => {
        cy.visit('/MappIntelligence-product-aeoeue/MAPP10001');
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Catalogue');
                expect(data.contentSubcategory).to.equal('Product Detail');
                expect(data.currency).to.equal('EUR');
                expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-product-aeoeue/MAPP10001');
                expect(data.pageTitle).to.equal('MappIntelligence-product-äöü | MAPP10001');
                expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
                expect(data.productCategory).to.equal('MappTestProducts');
                expect(data.productCost).to.equal('495.95');
                expect(data.productId).to.equal('MAPP10001');
                expect(data.productName).to.equal('MappIntelligence-product-äöü');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.equal('222aee2d4ef6484f99e541a03976d867');
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('MappSubCategory');
                expect(data.shoppingCartStatus).to.equal('view');
            });
    });

    it('normal product: multiple add to cart', () => {
        let wts;
        let data;
        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/MappIntelligence-product-aeoeue/MAPP10001');
        cy.window().its('wts.push').should('exist');
        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push', () => {
                data = JSON.parse(JSON.stringify(win._ti));
            }).as('wts');
        });

        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledOnce;
            expect(data.pageRequestType).to.equal('virtual');
            expect(data.contentCategory).to.equal('Catalogue');
            expect(data.contentSubcategory).to.equal('Product Detail');
            expect(data.currency).to.equal('EUR');
            expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-product-aeoeue/MAPP10001');
            expect(data.pageTitle).to.equal('MappIntelligence-product-äöü | MAPP10001');
            expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
            expect(data.productCategory).to.equal('MappTestProducts');
            expect(data.productCost).to.equal('2479.75');
            expect(data.productId).to.equal('MAPP10001');
            expect(data.productName).to.equal('MappIntelligence-product-äöü');
            expect(data.productQuantity).to.equal('5');
            expect(data.productShopwareId).to.equal('222aee2d4ef6484f99e541a03976d867');
            expect(data.productSoldOut).to.equal('');
            expect(data.productSubCategory).to.equal('MappSubCategory');
            expect(data.shoppingCartStatus).to.equal('add');
        });
    });

    it('soldout product: view', () => {
        cy.visit('/MappIntelligence-product-soldout/MAPP100013');
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Catalogue');
                expect(data.contentSubcategory).to.equal('Product Detail');
                expect(data.currency).to.equal('EUR');
                expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-product-soldout/MAPP100013');
                expect(data.pageTitle).to.equal('MappIntelligence-product-soldout | MAPP100013');
                expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
                expect(data.productCategory).to.equal('MappTestProducts');
                expect(data.productCost).to.equal('1.99');
                expect(data.productId).to.equal('MAPP100013');
                expect(data.productName).to.equal('MappIntelligence-product-soldout');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.equal('333aee2d4ef6484f99e541a03976d867');
                expect(data.productSoldOut).to.equal('1');
                expect(data.productSubCategory).to.equal('MappSubCategory');
                expect(data.shoppingCartStatus).to.equal('view');
            });
    });

    it('soldout product: multiple add to cart', () => {
        let wts;
        let data;
        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/MappIntelligence-product-soldout/MAPP100013');
        cy.window().its('wts.push').should('exist');
        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push', () => {
                data = JSON.parse(JSON.stringify(win._ti));
            }).as('wts');
        });

        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledOnce;
            expect(data.pageRequestType).to.equal('virtual');
            expect(data.contentCategory).to.equal('Catalogue');
            expect(data.contentSubcategory).to.equal('Product Detail');
            expect(data.currency).to.equal('EUR');

            expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-product-soldout/MAPP100013');
            expect(data.pageTitle).to.equal('MappIntelligence-product-soldout | MAPP100013');
            expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
            expect(data.productCategory).to.equal('MappTestProducts');
            expect(data.productCost).to.equal('9.95');
            expect(data.productId).to.equal('MAPP100013');
            expect(data.productName).to.equal('MappIntelligence-product-soldout');
            expect(data.productQuantity).to.equal('5');
            expect(data.productShopwareId).to.equal('333aee2d4ef6484f99e541a03976d867');
            expect(data.productSoldOut).to.equal('1');
            expect(data.productSubCategory).to.equal('MappSubCategory');
            expect(data.shoppingCartStatus).to.equal('add');
        });
    });

    it('variable product: view, then switch', () => {
        cy.visit('/MappIntelligence-Variant-product/MappIntelligence-Variant-product-azure');
        cy.window().its('wts.push').should('exist');
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Catalogue');
                expect(data.contentSubcategory).to.equal('Product Detail');
                expect(data.currency).to.equal('EUR');
                expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-Variant-product/MappIntelligence-Variant-product-azure');
                expect(data.pageTitle).to.equal('MappIntelligence-Variant-product | azure | MappIntelligence-Variant-product-azure');
                expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
                expect(data.productCategory).to.equal('MappTestProducts');
                expect(data.productCost).to.equal('295.95');
                expect(data.productId).to.equal('MappIntelligence-Variant-product-azure');
                expect(data.productName).to.equal('MappIntelligence-Variant-product');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('MappSubCategory');
                expect(data.shoppingCartStatus).to.equal('view');
            });

        cy.get('.product-detail-configurator-option input').eq(0).click({force: true});
        cy.contains('MappIntelligence-Variant-product-aliceblue').should('be.visible');
        cy.window().its('wts.push').should('exist');
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Catalogue');
                expect(data.contentSubcategory).to.equal('Product Detail');
                expect(data.currency).to.equal('EUR');
                expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-Variant-product/MappIntelligence-Variant-product-aliceblue');
                expect(data.pageTitle).to.equal('MappIntelligence-Variant-product | aliceblue | MappIntelligence-Variant-product-aliceblue');
                expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
                expect(data.productCategory).to.equal('MappTestProducts');
                expect(data.productCost).to.equal('295.95');
                expect(data.productId).to.equal('MappIntelligence-Variant-product-aliceblue');
                expect(data.productName).to.equal('MappIntelligence-Variant-product');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('MappSubCategory');
                expect(data.shoppingCartStatus).to.equal('view');
            });
    });

    it('variable product: switch, then multiple add to cart', () => {
        let wts;
        let data;
        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/MappIntelligence-Variant-product/MappIntelligence-Variant-product-azure');
        cy.window().its('wts.push').should('exist');
        cy.get('.product-detail-configurator-option input').eq(0).click({force: true});
        cy.contains('MappIntelligence-Variant-product-aliceblue').should('be.visible');
        cy.window().its('wts.push').should('exist');

        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push', () => {
                data = JSON.parse(JSON.stringify(win._ti));
            }).as('wts');
        });

        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledOnce;
            expect(data.pageRequestType).to.equal('virtual');
            expect(data.contentCategory).to.equal('Catalogue');
            expect(data.contentSubcategory).to.equal('Product Detail');
            expect(data.currency).to.equal('EUR');
            expect(data.pageName).to.equal('docker.vm:8000/MappIntelligence-Variant-product/MappIntelligence-Variant-product-aliceblue');
            expect(data.pageTitle).to.equal('MappIntelligence-Variant-product | aliceblue | MappIntelligence-Variant-product-aliceblue');
            expect(data.productCategories).to.deep.equal(['MappTestProducts', 'MappSubCategory']);
            expect(data.productCategory).to.equal('MappTestProducts');
            expect(data.productCost).to.equal('1479.75');
            expect(data.productId).to.equal('MappIntelligence-Variant-product-aliceblue');
            expect(data.productName).to.equal('MappIntelligence-Variant-product');
            expect(data.productQuantity).to.equal('5');
            expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
            expect(data.productSoldOut).to.equal('');
            expect(data.productSubCategory).to.equal('MappSubCategory');
            expect(data.shoppingCartStatus).to.equal('add');
        });
    });
});
