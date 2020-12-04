const ProductFixture = require("../service/product.fixture");

/**
 * Creates a product
 * @memberOf Cypress.Chainable#
 * @name createProduct
 * @function
 * @param {Object} productData - Data to base the product on
 */
Cypress.Commands.add('createProduct', (productData = {}) => {
    const fixture = new ProductFixture();
    fixture.setProductFixture(productData).then(()=>{});
});

// Test can look like this:
// it('create product',{
//     env: {
//         apiVersion: 'v1'
//     }
// }, () => {
//     cy.createProduct({name: 'testproduct2', stock: 44, taxName: "7%", productNumber: "testblabla2",
//         price: [
//             {
//                 gross: 12.87,
//                 linked: true,
//                 net: 11.7}
//         ]});
// });



// STUPID STUPID STUPID
// Cypress.Commands.add('createProduct', (productData) => {
//     cy.server();
//     cy.route({
//         url: '/api/v2/product',
//         method: 'post'
//     }).as('saveProduct');
//     cy.route({
//         url: '/api/v2/search/property-group',
//         method: 'post'
//     }).as('propertyGroup');
//
//     cy.loginViaApi()
//         .then(() => {
//             cy.visit('/admin#/sw/product/index');
//         });
//     cy.contains('Add product').click();
//     cy.get('input[placeholder="Select Sales Channel..."')
//         .click()
//         .wait(5000)
//         .type(productData.saleschannel)
//         .wait(5000)
//         .type('{enter}')
//         .wait(5000);
//
//     productData.categories.forEach( (category) => {
//         cy.get('.sw-category-tree__input-field').type(category);
//         cy.contains(category).should('be.visible');
//         cy.get('.sw-category-tree__input-field').type('{enter}');
//     });
//
//     cy.get('input[name=sw-field--product-name]').clear().type(productData.title);
//     cy.get('input[name=sw-field--product-productNumber]').clear().type(productData.productNumber);
//     cy.get('input[name=sw-price-field-gross]').eq(0).clear().type(productData.price);
//     cy.get('input[name=sw-field--product-stock]').clear().type(productData.stock);
//
//     cy.contains('Save').wait(2000).click();
//     cy.wait('@saveProduct', {timeout: 120000});
//
//     if(productData.variant) {
//
//         cy.get('.sw-tabs-item.sw-product-detail__tab-variants').click();
//         cy.contains('Start variant generator').click();
//
//         cy.wait(1000);
//         productData.variant.searchTerms.forEach( (searchTerm, termIndex) => {
//             if(termIndex === 0) {
//                 cy.contains(searchTerm.category).click({force: true});
//                 cy.get('.sw-property-search__tree-selection__option_grid input[type=checkbox]')
//                     .should('be.visible')
//                     .click({multiple: true})
//                     .wait(5000);
//             }
//             // cy.get('.sw-property-search__tree-selection__option_grid .sw-grid-row')
//             //     .each( (el, index) => {
//             //         el.find('.sw-grid__cell-content.is--truncate')
//             //             .each( (_n, element) => {
//             //                 if(searchTerm.value === element.innerText) {
//             //                     cy.wait(1000);
//             //                     cy.get(`.sw-property-search__tree-selection__option_grid .sw-grid__row--${index} input[type=checkbox]`)
//             //                         .click()
//             //                         .wait(2000);
//             //                 }
//             //             });
//             //     })
//         });
//         cy.get('.sw-modal__footer button.sw-button--primary').eq(0).click();
//         cy.contains('Actions performed according to current configuration:').should('be.visible');
//         cy.get('.sw-modal__footer button.sw-button--primary').eq(1).click();
//         cy.wait('@propertyGroup');
//         cy.wait(2000);
//     }
// });
