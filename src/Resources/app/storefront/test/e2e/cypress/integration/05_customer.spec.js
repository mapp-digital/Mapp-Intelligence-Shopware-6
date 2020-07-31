// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: User and account', () => {
    const yearsSince1970 = (new Date().getFullYear() - 1970).toString();

    it('register customers', () => {
        // activate birthday
        cy.server();
        cy.route({
            url: '/api/v1/_action/system-config/batch',
            method: 'post'
        }).as('saveConfig');

        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/settings/login/registration/index');
            });
        cy.get('input[name="core.loginRegistration.showBirthdayField"]').check();
        cy.get('.sw-button-process__content').click();
        cy.wait('@saveConfig');

        cy.fixture('customers').then( (customers) => {
            cy.createCustomer(customers.female);
            cy.createCustomer(customers.male);
            cy.createCustomer(customers.unknown);
        });
    });

    it('Login male customer', () => {
        cy.fixture('customers').then( (customers) => {
            cy.loginAsCustomer(customers.male);
        });

        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageName).to.equal('localhost:8000/account');
                expect(data.pageTitle).to.equal('Demostore');
                expect(data.contentCategory).to.equal('Account');
                expect(data.gender).to.equal('1');
                expect(data.age).to.equal(yearsSince1970);
                expect(data.eMailSubscription).to.equal("2");
                expect(data.customerId).to.match(/^[a-f0-9]{32}$/);
            });
    });

    it('Login female customer', () => {
        cy.fixture('customers').then( (customers) => {
            cy.loginAsCustomer(customers.female);
        });

        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageName).to.equal('localhost:8000/account');
                expect(data.pageTitle).to.equal('Demostore');
                expect(data.contentCategory).to.equal('Account');
                expect(data.gender).to.equal('2');
                expect(data.age).to.equal(yearsSince1970);
                expect(data.eMailSubscription).to.equal("2");
                expect(data.customerId).to.match(/^[a-f0-9]{32}$/);
            });
    });

    it('Login customer with unknown gender', () => {
        cy.fixture('customers').then( (customers) => {
            cy.loginAsCustomer(customers.unknown);
        });

        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.pageName).to.equal('localhost:8000/account');
                expect(data.pageTitle).to.equal('Demostore');
                expect(data.contentCategory).to.equal('Account');
                expect(data.gender).to.equal('0');
                expect(data.age).to.equal(yearsSince1970);
                expect(data.eMailSubscription).to.equal("2");
                expect(data.customerId).to.match(/^[a-f0-9]{32}$/);
            });
    });

    it('email subscription activated', () => {
        cy.server();
        cy.route({
            url: '/widgets/account/newsletter',
            method: 'post'
        }).as('updateAccount');

        cy.fixture('customers').then( (customers) => {
            cy.loginAsCustomer(customers.male);
        });
        cy.visit('/account');
        cy.get('#newsletterRegister').check({force: true});
        cy.wait('@updateAccount');
        cy.visit('/');
        let data;
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data.gender).to.equal('1');
                expect(data.age).to.equal(yearsSince1970);
                expect(data.eMailSubscription).to.equal("1");
                expect(data.customerId).to.match(/^[a-f0-9]{32}$/);
            });
    });
});

