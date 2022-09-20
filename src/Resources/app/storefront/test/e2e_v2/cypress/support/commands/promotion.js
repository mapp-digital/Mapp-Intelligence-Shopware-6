const PromotionFixture = require("../service/promotion.fixture");

/**
 * Creates a category
 * @memberOf Cypress.Chainable#
 * @name createPromotion
 * @function
 * @param {String} name - Name of the Promotion
 * @param {String} code - Coupon code
 */
Cypress.Commands.add('createPromotion', (name = 'MappCoupon', code = 'mapptest') => {
    const fixture = new PromotionFixture();
    return fixture.setPromotionFixture(name, code);
});
