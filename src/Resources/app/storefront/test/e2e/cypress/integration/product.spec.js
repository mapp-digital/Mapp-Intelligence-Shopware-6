// / <reference types="Cypress" />

describe('Product detail datalayer', () => {

    it('create test products', () => {
        cy.fixture('products').then( (products) => {
            cy.createProduct(products.normal);
            cy.createProduct(products.soldout);
            cy.createProduct(products.variant);
        });
    });
});
