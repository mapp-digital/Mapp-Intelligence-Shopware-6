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
    cy.route({
        url: '/api/v2/search/property-group',
        method: 'post'
    }).as('propertyGroup');



    cy.loginViaApi()
        .then(() => {
            cy.visit('/admin#/sw/product/index');
        });
    cy.contains('Add product').click();
    productData.categories.forEach( (category) => {
        cy.get('.sw-category-tree__input-field').type(category);
        cy.contains(category).should('be.visible');
        cy.get('.sw-category-tree__input-field').type('{enter}');
    });
    cy.get('input.sw-select-selection-list__input').eq(0).type(productData.saleschannel + '{enter}', {force: true});
    cy.get('input[name=sw-field--product-name]').clear().type(productData.title);
    cy.get('input[name=sw-field--product-productNumber]').clear().type(productData.productNumber);
    cy.get('input[name=sw-price-field-gross]').eq(0).clear().type(productData.price);
    cy.get('input[name=sw-field--product-stock]').clear().type(productData.stock);

    cy.contains('Save').click();
    cy.wait('@saveProduct', {timeout: 120000});

    if(productData.variant) {
        cy.contains('Variant generator').click();
        cy.contains('Start variant generator').click();
        productData.variant.searchTerms.forEach( (searchTerm) => {
            cy.get('.sw-property-search__search-field-container input').eq(0).type(searchTerm);
            cy.contains('color / ' + searchTerm).should('be.visible');
            cy.get('.sw-grid__body input').eq(0).check();
            cy.wait(500);
        });
        cy.get('.sw-modal__footer button.sw-button--primary').eq(0).click();
        cy.contains('Actions performed according to current configuration:').should('be.visible');
        cy.get('.sw-modal__footer button.sw-button--primary').eq(1).click();
        cy.wait('@propertyGroup');
        cy.wait(2000);
    }



});
