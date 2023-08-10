/**
 * Logs in as customer
 * @memberOf Cypress.Chainable#
 * @name loginAsCustomer
 * @function
 * @param {Object} customer data
 */
Cypress.Commands.add('loginAsCustomer', (customerData) => {
    cy.visit('/account/logout');
    cy.visit('/account/login');
    cy.get('#loginMail').type(customerData.email);
    cy.get('#loginPassword').type(customerData.password);
    cy.get('.login-form').submit();
});

/**
 * Creates a customer
 * @memberOf Cypress.Chainable#
 * @name createCustomer
 * @function
 * @param {Object} customer data
 */
Cypress.Commands.add('createCustomer', (customerData) => {
    cy.visit('/account/logout');
    cy.visit('/account/login');
    cy.get('#personalSalutation').select(customerData.gender);
    cy.get('#personalFirstName').type(customerData.firstName);
    cy.get('#personalLastName').type(customerData.lastName);
    cy.get('select[name=birthdayDay').select(customerData.birthday.day);
    cy.get('select[name=birthdayMonth').select(customerData.birthday.month);
    cy.get('select[name=birthdayYear').select(customerData.birthday.year);
    cy.get('#personalMail').type(customerData.email);
    cy.get('#personalPassword').type(customerData.password);
    cy.get('#billingAddressAddressStreet').type(customerData.street);
    cy.get('#billingAddressAddressZipcode').type(customerData.postal);
    cy.get('#billingAddressAddressCity').type(customerData.city);
    cy.get('#billingAddressAddressCountry > option')
        .eq(customerData.country)
        .then(element => cy.get('#billingAddressAddressCountry').select(element.val()));
    cy.get('.register-form').submit();
});
