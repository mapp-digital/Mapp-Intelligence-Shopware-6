const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

class ShipmentFixture extends AdminFixtureService {
    setShipmentFixture() {

        const rule = () => this.search('rule', {
            field: 'name',
            type: 'equals',
            value: 'Cart >= 0'
        });

        const standardShippingMethod = () => this.search('shipping-method', {
            field: 'name',
            type: 'equals',
            value: 'Standard'
        });
        const expressShippingMethod = () => this.search('shipping-method', {
            field: 'name',
            type: 'equals',
            value: 'Express'
        });

        return Promise.all([rule(), standardShippingMethod(), expressShippingMethod()])
            .then(([rule, standardShippingMethod, expressShippingMethod]) => {
                const payload = {
                    availabilityRuleId: rule.id
                }
                this.apiClient.patch(`/v2/shipping-method/${expressShippingMethod.id}?_response=true`, payload)
                return this.apiClient.patch(`/v2/shipping-method/${standardShippingMethod.id}?_response=true`, payload);
            });
    }
}

module.exports = ShipmentFixture;
global.ShipmentFixtureService = new ShipmentFixture();
