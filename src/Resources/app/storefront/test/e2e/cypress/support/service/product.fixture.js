const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

class ProductFixture extends AdminFixtureService {
    setProductFixture(userData, categoryName = 'Catalogue #1') {
        const taxName = userData.taxName || 'Standard rate';

        delete userData.taxName;

        const findTaxId = (name) => this.search('tax', {
            field: 'name',
            type: 'equals',
            value: name
        });
        const findManufacturerId = () => this.search('product-manufacturer', {
            field: 'name',
            type: 'equals',
            value: 'shopware AG'
        });

        const currencyId = () => this.search('currency', {
            field: 'name',
            type: 'equals',
            value: 'Euro'
        });

        return Promise.all([findManufacturerId(), findTaxId(taxName), currencyId()])
            .then(([manufacturer, tax, currencyId]) => {
                userData.price[0].currencyId = currencyId.id;
                return Object.assign({}, {
                    taxId: tax.id,
                    manufacturerId: manufacturer.id
                }, userData);
            }).then((finalProductData) => {
                return this.apiClient.post(`/${Cypress.env('apiVersion')}/product?_response=true`, finalProductData);
            }).then((result) => {
                return this.setProductVisible(userData.name, categoryName);
            });
    }

    setProductVisible(productName, categoryName) {
        let salesChannelId = '';
        let productId = '';

        return this.apiClient.post(`/${Cypress.env('apiVersion')}/search/sales-channel?response=true`, {
            filter: [{
                field: 'name',
                type: 'equals',
                value: 'Storefront'
            }]
        }).then((data) => {
            salesChannelId = data.id;

            return this.apiClient.post(`/${Cypress.env('apiVersion')}/search/product?response=true`, {
                filter: [{
                    field: 'name',
                    type: 'equals',
                    value: productName
                }]
            })
        }).then((data) => {
            productId = data.id;
        }).then(() => {
            return this.apiClient.post(`/${Cypress.env('apiVersion')}/search/category?response=true`, {
                filter: [{
                    field: 'name',
                    type: 'equals',
                    value: categoryName
                }]
            })
        }).then((result) => {
            return this.update({
                id: productId,
                type: 'product',
                data: {
                    visibilities: [{
                        visibility: 30,
                        salesChannelId: salesChannelId
                    }],
                    categories: [{
                        id: result.id
                    }]
                }
            });
        })
    }
}

module.exports = ProductFixture;
global.ProductFixtureService = new ProductFixture();
