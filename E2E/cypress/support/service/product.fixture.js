const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

class ProductFixture extends AdminFixtureService {
    categoryId = '';
    color1 = '';
    color2 = '';

    setProductFixture(userData, categoryName = 'MappTestProducts') {
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

        const findCategoryId = () => this.search('category', {
            field: 'name',
            type: 'equals',
            value: categoryName
        })

       return Promise.all([findManufacturerId(), findTaxId(taxName), currencyId(), findCategoryId()])
            .then(([manufacturer, tax, currencyId, categoryId]) => {
                this.categoryId = categoryId.id;
                userData.price[0].currencyId = currencyId.id;
                return Object.assign({}, {
                    taxId: tax.id,
                    manufacturerId: manufacturer.id
                }, userData);
            }).then((finalProductData) => {
                return this.apiClient.post(`/product?_response=true`, finalProductData);
            }).then(() => {
                this.setProductVisible(userData.name, this.categoryId, userData);
            });
    }

    update(userData) {
        if (!userData.id) {
            throw new Error('Update fixtures must always contain an id');
        }
        return this.apiClient.patch(`/${userData.type}/${userData.id}`, {...userData.data, categories: [{id: this.categoryId}]});
    }

    search(type, filter) {
        return this.apiClient.post(`/search/${type}?response=true`, {
            filter: [{
                field: filter.field ? filter.field : 'name',
                type: 'equals',
                value: filter.value
            }]
        });
    }

    setProductVisible(productName, categoryId, userData) {
        let salesChannelId = '';
        let productId = '';

        return this.apiClient.post(`/search/sales-channel?response=true`, {
            filter: [{
                field: 'name',
                type: 'equals',
                value: 'Storefront'
            }]
        }).then((data) => {
            salesChannelId = data.id;

            return this.apiClient.post(`/search/product?response=true`, {
                filter: [{
                    field: 'name',
                    type: 'equals',
                    value: productName
                }]
            })
        }).then((data) => {
            productId = data.id;
        }).then(() => {
            return this.update({
                id: productId,
                type: 'product',
                data: {
                    visibilities: [{
                        visibility: 30,
                        salesChannelId: salesChannelId
                    }],
                    categories: [
                        { // TODO: get categoryID that was set instead of hardcode
                            id: '111aee2d4ef6484f99e541a03976d865'
                         },
                        {id : '111aee2d4ef6484f99e541a03976d867'}
                    ]
                }
            });
        }).then(() => {
            return this.search('property-group',  { value: 'colour'}
            );
        }).then((propertyGroup) => {
            if(!userData.color1 && !userData.color2) {
                return null;
            }
            return this.apiClient.post(`search/property-group/${propertyGroup.id}/options`, {
                "page":1,
                "associations":{
                    "group":{
                        "total-count-mode":1
                    }
                },
                "total-count-mode":1
            });
        }).then((options) => {
            if(!options) {
                return null;
            }
            this.color1 = options.filter(option => option.attributes.name === userData.color1)[0].id;
            this.color2 = options.filter(option => option.attributes.name === userData.color2)[0].id;

            return this.apiClient.post(`/_action/sync`, [
                {
                    "action":"upsert",
                    "entity":"product",
                    "payload":[
                        {
                            "parentId":productId,
                            "options":[
                                {
                                    "id":this.color1
                                }
                            ],
                            "stock":userData.stock,
                            "productNumber":`${userData.name}-${userData.color1}`
                        },
                        {
                            "parentId":productId,
                            "options":[
                                {
                                    "id":this.color2
                                }
                            ],
                            "stock":userData.stock,
                            "productNumber":`${userData.name}-${userData.color2}`
                        }
                    ]
                }
            ]);
        }).then((result) => {
            if(!result) {
                return null;
            }
            this.update({
                id: productId,
                type: 'product',
                data: {
                    "configuratorSettings":[
                        {
                            "optionId":this.color1
                        },
                        {
                            "optionId":this.color2
                        }
                    ]
                }

            })
        })
    }
}

module.exports = ProductFixture;
global.ProductFixtureService = new ProductFixture();
