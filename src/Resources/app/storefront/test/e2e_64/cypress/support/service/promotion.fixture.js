const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

class PromotionFixture extends AdminFixtureService {
    setPromotionFixture(promotionName, discountCode) {
        const getSalesChannelId = () => {
            return this.apiClient.post(`/search/sales-channel?response=true`, {
                filter: [{
                    field: 'name',
                    type: 'equals',
                    value: 'Storefront'
                }]
            });
        }
        return Promise.all([getSalesChannelId()])
            .then(([salesChannelId]) => {
                return this.apiClient.post(`/promotion`, {
                    "name":promotionName,
                    "active":true,
                    "useCodes":true,
                    "code": discountCode,
                    "useIndividualCodes":false,
                    "discounts":[
                        {
                            "scope":"cart",
                            "type":"absolute",
                            "value":3,
                            "considerAdvancedRules":false,
                            "sorterKey":"PRICE_ASC",
                            "applierKey":"ALL",
                            "usageKey":"ALL"
                        }
                    ],
                    "salesChannels":[
                        {
                            "salesChannelId":salesChannelId.id,
                            "priority":1
                        }
                    ]
                });
            });
    }
}

module.exports = PromotionFixture;
