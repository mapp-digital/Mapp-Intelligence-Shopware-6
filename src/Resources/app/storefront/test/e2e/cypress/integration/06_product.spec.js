// / <reference types="Cypress" />

describe('Product detail datalayer', () => {

    it('create test products', () => {
        cy.fixture('products').then( (products) => {
            cy.createProduct(products.normal);
            cy.createProduct(products.soldout);
            cy.createProduct(products.variant);
        });
    });

    it('normal product: view', () => {
        cy.visit('/Mapp-Test-Product-Normael/maeppnormal');
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
                expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Normael/maeppnormal');
                expect(data.pageTitle).to.equal('Mapp Test Product - Normäl | mäppnormal');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('1000.99');
                expect(data.productId).to.equal('mäppnormal');
                expect(data.productName).to.equal('Mapp Test Product - Normäl');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('');
                expect(data.productSubCategory).to.equal('Movies');
                expect(data.shoppingCartStatus).to.equal('view');
            });
    });

    it('normal product: multiple add to cart', () => {
        let wts;
        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/Mapp-Test-Product-Normael/maeppnormal');
        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push', () => {
                const data = win._ti;
                cy.should( () => {
                    expect(data.pageRequestType).to.equal('virtual');
                    expect(data.contentCategory).to.equal('Catalogue');
                    expect(data.contentSubcategory).to.equal('Product Detail');
                    expect(data.currency).to.equal('EUR');
                    expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Normael/maeppnormal');
                    expect(data.pageTitle).to.equal('Mapp Test Product - Normäl | mäppnormal');
                    expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                    expect(data.productCategory).to.equal('Catalogue #1');
                    expect(data.productCost).to.equal(5004.95);
                    expect(data.productId).to.equal('mäppnormal');
                    expect(data.productName).to.equal('Mapp Test Product - Normäl');
                    expect(data.productQuantity).to.equal('5');
                    expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                    expect(data.productSoldOut).to.equal('');
                    expect(data.productSubCategory).to.equal('Movies');
                    expect(data.shoppingCartStatus).to.equal('add');
                });
            }).as('wts');
        });

        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledOnce;
        });
    });

    it('soldout product: view', () => {
        cy.visit('/Mapp-Test-Product-Soldout/mappsoldout');
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
                expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Soldout/mappsoldout');
                expect(data.pageTitle).to.equal('Mapp Test Product - Soldout | mappsoldout');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('99.99');
                expect(data.productId).to.equal('mappsoldout');
                expect(data.productName).to.equal('Mapp Test Product - Soldout');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('1');
                expect(data.productSubCategory).to.equal('Movies');
                expect(data.shoppingCartStatus).to.equal('view');
            });
    });

    it('soldout product: multiple add to cart', () => {
        let wts;
        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/Mapp-Test-Product-Soldout/mappsoldout');
        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push', () => {
                const data = win._ti;
                cy.should( () => {
                    expect(data.pageRequestType).to.equal('virtual');
                    expect(data.contentCategory).to.equal('Catalogue');
                    expect(data.contentSubcategory).to.equal('Product Detail');
                    expect(data.currency).to.equal('EUR');
                    expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Soldout/mappsoldout');
                    expect(data.pageTitle).to.equal('Mapp Test Product - Soldout | mappsoldout');
                    expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                    expect(data.productCategory).to.equal('Catalogue #1');
                    expect(data.productCost).to.equal(499.95);
                    expect(data.productId).to.equal('mappsoldout');
                    expect(data.productName).to.equal('Mapp Test Product - Soldout');
                    expect(data.productQuantity).to.equal('5');
                    expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                    expect(data.productSoldOut).to.equal('1');
                    expect(data.productSubCategory).to.equal('Movies');
                    expect(data.shoppingCartStatus).to.equal('add');
                });
            }).as('wts');
        });

        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledOnce;
        });
    });

    it('variable product: view, then switch', () => {
        cy.visit('/Mapp-Test-Product-Variable/mappvariable.1');
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
                expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Variable/mappvariable.1');
                expect(data.pageTitle).to.equal('Mapp Test Product - Variable | azure | mappvariable.1');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('999.99');
                expect(data.productId).to.equal('mappvariable.1');
                expect(data.productName).to.equal('Mapp Test Product - Variable');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('1');
                expect(data.productSubCategory).to.equal('Movies');
                expect(data.shoppingCartStatus).to.equal('view');
            });
        cy.contains('darkorange').click();
        cy.contains('Order number: mappvariable.3').should('be.visible');
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageRequestType).to.not.exist;
                expect(data.contentCategory).to.equal('Catalogue');
                expect(data.contentSubcategory).to.equal('Product Detail');
                expect(data.currency).to.equal('EUR');
                expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Variable/mappvariable.3');
                expect(data.pageTitle).to.equal('Mapp Test Product - Variable | darkorange | mappvariable.3');
                expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                expect(data.productCategory).to.equal('Catalogue #1');
                expect(data.productCost).to.equal('999.99');
                expect(data.productId).to.equal('mappvariable.3');
                expect(data.productName).to.equal('Mapp Test Product - Variable');
                expect(data.productQuantity).to.equal('1');
                expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                expect(data.productSoldOut).to.equal('1');
                expect(data.productSubCategory).to.equal('Movies');
                expect(data.shoppingCartStatus).to.equal('view');
            });
    });

    it('variable product: switch, then multiple add to cart', () => {
        let wts;
        cy.server();
        cy.route({
            url: '/checkout/line-item/add',
            method: 'post'
        }).as('addToCart');

        cy.visit('/Mapp-Test-Product-Variable/mappvariable.1');
        cy.contains('darkorange').click();
        cy.contains('Order number: mappvariable.3').should('be.visible');


        cy.window().then((win) => {
            wts = cy.stub(win.wts, 'push', () => {
                const data = win._ti;
                cy.should( () => {
                    expect(data.pageRequestType).to.equal('virtual');
                    expect(data.contentCategory).to.equal('Catalogue');
                    expect(data.contentSubcategory).to.equal('Product Detail');
                    expect(data.currency).to.equal('EUR');
                    expect(data.pageName).to.equal('localhost:8000/Mapp-Test-Product-Variable/mappvariable.3');
                    expect(data.pageTitle).to.equal('Mapp Test Product - Variable | darkorange | mappvariable.3');
                    expect(data.productCategories).to.deep.equal(["Catalogue #1", "Movies", "Games & Garden", "Beauty & Games", "Music, Toys & Baby"]);
                    expect(data.productCategory).to.equal('Catalogue #1');
                    expect(data.productCost).to.equal(4999.95);
                    expect(data.productId).to.equal('mappvariable.3');
                    expect(data.productName).to.equal('Mapp Test Product - Variable');
                    expect(data.productQuantity).to.equal('5');
                    expect(data.productShopwareId).to.match(/^[0-9a-f]{32}$/);
                    expect(data.productSoldOut).to.equal('1');
                    expect(data.productSubCategory).to.equal('Movies');
                    expect(data.shoppingCartStatus).to.equal('add');
                });
            }).as('wts');
        });

        cy.get('.custom-select.product-detail-quantity-select').select("5");
        cy.contains('Add to shopping cart').click();
        cy.wait('@addToCart').then(() => {
            expect(wts).to.be.calledOnce;
        });
    });


});
