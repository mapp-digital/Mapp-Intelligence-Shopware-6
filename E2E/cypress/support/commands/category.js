const CategoryFixture = require("../service/category.fixture");

/**
 * Creates a category
 * @memberOf Cypress.Chainable#
 * @name createCategory
 * @function
 * @param {String} name - Name of the category
 * @param {String} id - Id of the category
 */
Cypress.Commands.add('createCategory', (name = 'MappTestProducts', id = '111aee2d4ef6484f99e541a03976d865') => {
    const fixture = new CategoryFixture();
    return fixture.setCategoryFixture(name, id);
});

/**
 * Creates a subcategory
 * @memberOf Cypress.Chainable#
 * @name createSubCategory
 * @function
 * @param {String} name - Name of the subcategory
 * @param {String} parentName - name of the parent category
 * @param {String} id - Id of the subcategory
 */
Cypress.Commands.add('createSubCategory', (name = 'MappSubcategory', parent = 'MappTestProducts', id = '111aee2d4ef6484f99e541a03976d867') => {
    const fixture = new CategoryFixture();
    return fixture.setSubCategoryFixture(name, parent, id);
});
