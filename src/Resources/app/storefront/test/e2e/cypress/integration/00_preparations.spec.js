// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: General preparations', () => {

    it('convert imprint to landingpage', () => {
        let imprintRowNumber;
        const _r = /^Imprint$/;
        cy.server();
        cy.route({
            url: '/api/v*/cms-page/*',
            method: 'patch'
        }).as('updateCMSPage');

        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/cms/index');
            });
        cy.get('.sw-cms-list__list-grid-content > div')
            .each( (el) => {
                const title = el.find('.sw-cms-list-item__title')[0].innerText;
                if(_r.test(title)) {
                    imprintRowNumber = el[0].className.slice(-1);
                }
            })
            .should( () => {
                expect(imprintRowNumber).to.match(/^[0-9]{1,2}$/);
            }).then( () => {
            cy.get(`.sw-cms-list-item.sw-cms-list-item--${imprintRowNumber} > div.sw-cms-list-item__image`).click();
        });
        cy.get('button[title=Settings]').click();
        cy.contains('Settings').should('be.visible');
        cy.get('#sw-field--page-type').select('landingpage');
        cy.contains('Save').click();
        cy.wait('@updateCMSPage');
    });

    // it('make sure that standard shipping method is available', () => {
    //
    //     cy.server();
    //     cy.route({
    //         url: '/api/v*/search/shipping-method',
    //         method: 'post'
    //     }).as('updateShipping');
    //     cy.route({
    //         url: '/api/v*/search/rule',
    //         method: 'post'
    //     }).as('searchRule');
    //
    //     cy.loginViaApi()
    //         .then(() => {
    //             cy.visit('/admin#/sw/settings/shipping/index');
    //         });
    //     cy.contains('Standard').click();
    //     cy.get('.sw-settings-shipping-detail__top-rule .sw-select__selection-indicators')
    //         .click()
    //         .wait('@searchRule');
    //     cy.contains('Always valid').should('be.visible').click();
    //     cy.contains('Save').click({force: true}).wait('@updateShipping').wait(1000);
    // });

    // We create this shippingservice because sometimes SW6 Demo shop has none and I hope it defaukt to this one then.
    it('create a MAPP shipping service',{
        env: {
            apiVersion: 'v1'
        }
    }, () => {
        cy.createShippingFixture();
    });

    it('create mapp-test category and assign it to imprint', () => {
        let imprintRowNumber;
        const _r = /^Imprint$/;
        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/category/index');
            });
        cy.get('.sw-context-button__button').click();
        cy.contains('New subcategory').should('be.visible').click();
        cy.get('input[placeholder="Create category"').type('mapp-test{enter}');
        cy.contains('mapp-test').should('be.visible').click();
        cy.get('input[name=categoryActive]').should('be.visible').check();
        cy.contains('Assign layout').should('be.visible').click();
        cy.get('div.sw-container > div.sw-cms-layout-modal__content-item')
            .each( (el) => {
                const title = el.find('.sw-cms-list-item__title')[0].innerText;
                if(_r.test(title)) {
                    imprintRowNumber = el[0].className.slice(-1);
                }
            })
            .should( () => {
                expect(imprintRowNumber).to.match(/^[0-9]{1,2}$/);
            }).then( () => {
            cy.get(`.sw-cms-layout-modal__content-item.sw-cms-layout-modal__content-item--${imprintRowNumber} input`)
                .check();
            cy.get('.sw-modal__footer > button').eq(1).click();
            cy.get('#modalTitleEl').should('not.be.visible');
            cy.contains('Save').click();
            cy.wait(2000);
        });
    });
});

