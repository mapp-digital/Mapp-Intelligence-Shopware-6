/**
 * Creates a product
 * @memberOf Cypress.Chainable#
 * @name createProduct
 * @function
 * @param {Object} productData - Data to base the product on
 */
Cypress.Commands.add('createProduct', (productData) => {
    cy.server();
    cy.route({
        url: '/api/v2/product',
        method: 'post'
    }).as('saveProduct');

    cy.loginViaApi()
        .then(() => {
            cy.visit('/admin#/sw/product/index');
        });
    cy.contains('Add product').click();
    productData.categories.forEach( (category) => {
        cy.get('.sw-category-tree__input-field').type(category + '{enter}');
    });
    cy.get('input.sw-select-selection-list__input').eq(0).type(productData.saleschannel + '{enter}', {force: true});
    cy.get('input[name=sw-field--product-name]').clear().type(productData.title);
    cy.get('input[name=sw-field--product-productNumber]').clear().type(productData.productNumber);
    cy.get('input[name=sw-price-field-gross]').eq(0).clear().type(productData.price);
    cy.get('input[name=sw-field--product-stock]').clear().type(productData.stock);

    cy.contains('Save').click();
    cy.wait('@saveProduct');



});
