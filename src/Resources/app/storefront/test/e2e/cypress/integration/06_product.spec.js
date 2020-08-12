// / <reference types="Cypress" />

beforeEach( () => {
    cy.consentMapp();
});

describe('Product detail datalayer', () => {

    // it('create test subcategory', () => {
    //     const _r = /^mapp-test$/;
    //     cy.server();
    //     cy.route({
    //         url: '/api/v*/category',
    //         method: 'post'
    //     }).as('saveCategory');
    //
    //     cy.loginViaApi()
    //         .then(() => {
    //             cy.visit('/admin#/sw/category/index');
    //         });
    //     cy.get('.sw-tree-item__toggle > span.sw-icon').click();
    //     cy.contains('mapp-test').should('be.visible');
    //     cy.get('.sw-tree-item')
    //         .each( (el, index) => {
    //             const title = el.find('.sw-tree-item__label')[0].innerText;
    //             if(_r.test(title)) {
    //                 return el;
    //             }
    //         })
    //         .then( (el ) => {
    //             el.find('button').trigger('click');
    //             cy.contains('New subcategory')
    //                 .should('be.visible')
    //                 .click();
    //             cy.get('input[placeholder="Create category"').type('mapp-subcategory{enter}');
    //             cy.wait('@saveCategory');
    //         });
    // });
    //
    // it('create test products', () => {
    //     cy.fixture('products').then( (products) => {
    //         cy.createProduct(products.normal);
    //         cy.createProduct(products.soldout);
    //         cy.createProduct(products.variant);
    //     });
    // });

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
                expect(data.pageName).to.equal('localhost:8000/MappIntelligence-product-aeoeue/MAPP10001');
                expect(data.pageTitle).to.equal('MappIntelligence product äöü | MAPP10001');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Free time & electronics"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('495.95');
                expect(data.productId).to.equal('MAPP10001');
                expect(data.productName).to.equal('MappIntelligence product äöü');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('Free time & electronics');
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
            expect(data.pageName).to.equal('localhost:8000/MappIntelligence-product-aeoeue/MAPP10001');
            expect(data.pageTitle).to.equal('MappIntelligence product äöü | MAPP10001');
            expect(data.productCategories).to.deep.equal(["Catalogue #1", "Free time & electronics"]);
            expect(data.productCategory).to.equal('Catalogue #1');
            expect(data.productCost).to.equal('2479.75');
            expect(data.productId).to.equal('MAPP10001');
            expect(data.productName).to.equal('MappIntelligence product äöü');
            expect(data.productQuantity).to.equal('5');
            expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
            expect(data.productSoldOut).to.equal('');
            expect(data.productSubCategory).to.equal('Free time & electronics');
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
                expect(data.pageName).to.equal('localhost:8000/MappIntelligence-product-soldout/MAPP100013');
                expect(data.pageTitle).to.equal('MappIntelligence product soldout | MAPP100013');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Food", "Sweets"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('1.99');
                expect(data.productId).to.equal('MAPP100013');
                expect(data.productName).to.equal('MappIntelligence product soldout');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('1');
                expect(data.productSubCategory).to.equal('Food');
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

            expect(data.pageName).to.equal('localhost:8000/MappIntelligence-product-soldout/MAPP100013');
            expect(data.pageTitle).to.equal('MappIntelligence product soldout | MAPP100013');
            expect(data.productCategories).to.deep.equal(["Catalogue #1", "Food", "Sweets"]);
            expect(data.productCategory).to.equal('Catalogue #1');
            expect(data.productCost).to.equal('9.95');
            expect(data.productId).to.equal('MAPP100013');
            expect(data.productName).to.equal('MappIntelligence product soldout');
            expect(data.productQuantity).to.equal('5');
            expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
            expect(data.productSoldOut).to.equal('1');
            expect(data.productSubCategory).to.equal('Food');
            expect(data.shoppingCartStatus).to.equal('add');
        });
    });

    it('variable product: view, then switch', () => {
        cy.visit('/MappIntelligence-Variant-product/SWDEMO10005.5');
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
                expect(data.pageName).to.equal('localhost:8000/MappIntelligence-Variant-product/SWDEMO10005.5');
                expect(data.pageTitle).to.equal('MappIntelligence Variant product | White | M | SWDEMO10005.5');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Clothing", "Women"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('19.99');
                expect(data.productId).to.equal('SWDEMO10005.5');
                expect(data.productName).to.equal('MappIntelligence Variant product');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('Clothing');
                expect(data.shoppingCartStatus).to.equal('view');
            });

        cy.get('.product-detail-configurator-option input').eq(0).click({force: true});
        cy.contains('SWDEMO10005.1').should('be.visible');
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
                expect(data.pageName).to.equal('localhost:8000/MappIntelligence-Variant-product/SWDEMO10005.1');
                expect(data.pageTitle).to.equal('MappIntelligence Variant product | Blue | M | SWDEMO10005.1');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Clothing", "Women"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('19.99');
                expect(data.productId).to.equal('SWDEMO10005.1');
                expect(data.productName).to.equal('MappIntelligence Variant product');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('Clothing');
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

        cy.visit('/MappIntelligence-Variant-product/SWDEMO10005.5');
        cy.window().its('wts.push').should('exist');
        cy.get('.product-detail-configurator-option input').eq(0).click({force: true});
        cy.contains('SWDEMO10005.1').should('be.visible');
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
            expect(data.pageName).to.equal('localhost:8000/MappIntelligence-Variant-product/SWDEMO10005.1');
            expect(data.pageTitle).to.equal('MappIntelligence Variant product | Blue | M | SWDEMO10005.1');
            expect(data.productCategories).to.deep.equal(["Catalogue #1", "Clothing", "Women"]);
            expect(data.productCategory).to.equal('Catalogue #1');
            expect(data.productCost).to.equal('99.95');
            expect(data.productId).to.equal('SWDEMO10005.1');
            expect(data.productName).to.equal('MappIntelligence Variant product');
            expect(data.productQuantity).to.equal('5');
            expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
            expect(data.productSoldOut).to.equal('');
            expect(data.productSubCategory).to.equal('Clothing');
            expect(data.shoppingCartStatus).to.equal('add');
        });
    });
});
