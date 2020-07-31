// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: Install and Config', () => {
    let _pluginRowNumber;

    beforeEach(() => {
        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/plugin/index/list');
            });
        cy.contains('Mapp Intelligence', {timeout: 100000}).should('be.visible');
        cy.get('.sw-data-grid__body > tr').each( (el) => {
            if(/^Mapp Intelligence/.test(el[0].innerText)) {
                _pluginRowNumber = el[0].className.slice(-1);
            }
        })
    });

    // it('install plugin', () => {
    //     cy.server();
    //     cy.route({
    //         url: '/api/v2/search/plugin',
    //         method: 'post'
    //     }).as('installPlugin');
    //
    //     cy.get(`.sw-data-grid__row--${_pluginRowNumber} .sw-context-button__button`)
    //         .click({force: true});
    //     cy.get('.sw-context-menu').should('be.visible');
    //     cy.contains('Install').click();
    //     cy.get('.sw-context-menu').should('not.exist');
    //
    //     cy.wait('@installPlugin').then(() => {
    //         cy.get('.sw-notifications__notification--0 .sw-alert__message')
    //             .should('be.visible')
    //             .contains('Plugin has been installed.');
    //     });
    // });
    //
    // it('activate plugin', () => {
    //     cy.server();
    //     cy.route({
    //         url: '/api/v2/search/plugin',
    //         method: 'post'
    //     }).as('activatePlugin');
    //
    //     cy.get(`.sw-data-grid__row--${_pluginRowNumber} input`).check();
    //     cy.wait('@activatePlugin', {timeout: 120000});
    // });

    it('convert imprint to landingpage', () => {
        let imprintRowNumber;
        const _r = /^Imprint$/;
        cy.server();
        cy.route({
            url: '/api/v2/cms-page/*',
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

    it('configure, check _tiConfig, wts and blacklist', () => {
        let config;
        let data;

        cy.server();
        cy.route({
            url: '/api/v1/_action/system-config/batch',
            method: 'post'
        }).as('saveData');

        cy.get(`.sw-data-grid__row--${_pluginRowNumber} .sw-context-button__button`)
            .click({force: true});
        cy.get('.sw-context-menu').should('be.visible');
        cy.contains('Config').click();
        cy.get('.sw-context-menu').should('not.exist');

        cy.get('input[name="MappIntelligence.config.tiId"]')
            .clear()
            .type('136699033798929');
        cy.get('input[name="MappIntelligence.config.blacklist"]')
            .clear()
            .type('pageName,pageTitle');
        cy.get('.sw-plugin-config__save-action').click();

        cy.wait('@saveData').then(() => {
            cy.get('.sw-notifications__notification--0 .sw-alert__message')
                .should('be.visible')
                .contains('Configuration has been saved.');
        });

        cy.visit('/');
        cy.window()
            .then((win) => {
                config = win._tiConfig;
                data = win._ti;
                return win;
            })
            .then((win) => {
                expect(config.tiId).to.equal('136699033798929');
                expect(win.wts).to.exist;
                expect(data).to.exist;
                expect(data.pageName).to.not.exist;
                expect(data.pageTitle).to.not.exist;
            });
    });

    it('deactivate blacklist', () => {
        let data;

        cy.server();
        cy.route({
            url: '/api/v1/_action/system-config/batch',
            method: 'post'
        }).as('saveData');

        cy.get(`.sw-data-grid__row--${_pluginRowNumber} .sw-context-button__button`)
            .click({force: true});
        cy.get('.sw-context-menu').should('be.visible');
        cy.contains('Config').click();
        cy.get('.sw-context-menu').should('not.exist');

        cy.get('input[name="MappIntelligence.config.blacklist"]')
            .clear();
        cy.get('.sw-plugin-config__save-action').click();

        cy.wait('@saveData').then(() => {
            cy.get('.sw-notifications__notification--0 .sw-alert__message')
                .should('be.visible')
                .contains('Configuration has been saved.');
        });

        cy.visit('/');
        cy.window()
            .then((win) => {
                data = win._ti;
            })
            .then(() => {
                expect(data).to.exist;
                expect(data.pageName).to.exist;
                expect(data.pageTitle).to.exist;
            });
    });
});
