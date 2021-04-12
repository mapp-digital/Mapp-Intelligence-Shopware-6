// / <reference types="Cypress" />

describe('MappIntelligencePluginTests: General preparations', () => {

    it('create promotion and discount', () => {
        cy.createPromotion('MappCoupon', 'mapptest');
    });

    it('convert imprint to landingpage', () => {
        cy.callAdminApi('post', '/search/cms-page', {
            "page":1,"limit":25,"term":"Imprint","total-count-mode":1
        }).then( imprint => {
            cy.callAdminApi('patch', `/cms-page/${imprint.id}`, {
                "type":"landingpage"
            })
        });
    });

    it('create product categories', () => {
        cy.createCategory('MappTestProducts', '111aee2d4ef6484f99e541a03976d865');
        cy.createSubCategory('MappSubCategory', 'MappTestProducts', '111aee2d4ef6484f99e541a03976d867');
    });

    it('create test landingpage', () => {
        let salesChannelId = '';

        const getSalesChannelId = () => {
            return cy.callAdminApi('post', '/search/sales-channel', {
                "page":1,"limit":25,"term":"Storefront","total-count-mode":1
            });
        }
        const getImprint = () => {
            return cy.callAdminApi('post', '/search/cms-page', {
                "page":1,"limit":25,"term":"Imprint","total-count-mode":1
            });
        }

        getSalesChannelId().then(storefront => {
            salesChannelId = storefront.id;
        }).then(() => {
            getImprint().then(imprint => {
                console.log(salesChannelId, imprint.id)
                cy.callAdminApi('post', '/landing-page', {
                    "name":"Testlandingpage",
                    "url":"mapp",
                    "cmsPageId": imprint.id,
                    "salesChannels":[
                        {
                            "id": salesChannelId
                        }
                    ]
                });
            });
        });
    });

    it('create test products', () => {

        cy.createProduct({name: 'MappIntelligence-product-äöü', id: '222aee2d4ef6484f99e541a03976d867', stock: 44, productNumber: "MAPP10001",
            price: [
                {
                    gross: 495.95,
                    linked: true,
                    net: 490.95}
            ]}, 'MappSubCategory').then(() => {
            cy.createProduct({name: 'MappIntelligence-product-soldout', id: '333aee2d4ef6484f99e541a03976d867', stock: 0, productNumber: "MAPP100013",
                price: [
                    {
                        gross: 1.99,
                        linked: true,
                        net: 1}
                ]}, 'MappSubCategory').then(() => {
                cy.createProduct({name: 'MappIntelligence-Variant-product', id: '444aee2d4ef6484f99e541a03976d867', stock: 99, productNumber: "MAPPVAR", color1: "azure", color2: "aliceblue",
                    price: [
                        {
                            gross: 295.95,
                            linked: true,
                            net: 290.95}
                    ]}, 'MappSubCategory').then(() => {
                    cy.wait(10000);
                    cy.visit('/MappIntelligence-product-aeoeue/MAPP10001', {timeout: 30000});
                    cy.contains('MappIntelligence-product-äöü').should('be.visible');
                    cy.visit('/MappIntelligence-Variant-product/MappIntelligence-Variant-product-azure', {timeout: 30000});
                    cy.contains('MappIntelligence-Variant-product').should('be.visible');
                    cy.visit('/MappIntelligence-product-soldout/MAPP100013', {timeout: 30000});
                    cy.contains('MappIntelligence-product-soldout').should('be.visible');
                });
            });
        });
    });
});

