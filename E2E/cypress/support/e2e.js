// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './commands/commands';
import './commands/customer';
import './commands/consentCookie';
import './commands/shipment';
import './commands/api';

// test data comes from seed/seed.js (make seed), not from specs

// errors of the shop's own JavaScript must not fail the tests
// (this used to come with @shopware-ag/e2e-testsuite-platform)
Cypress.on('uncaught:exception', () => false);

Cypress.Screenshot.defaults({
    capture: 'viewport',
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
