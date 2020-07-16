// / <reference types="Cypress" />

describe('Create testproducts', () => {

    it('create normal product', () => {
        cy.fixture('products').then( (products) => {
            cy.createProduct(products.normal);
            cy.createProduct(products.soldout);
        });
    });
});
