const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

class ShipmentFixture extends AdminFixtureService {
    setShipmentFixture() {

        const rule = () => this.search('rule', {
            field: 'name',
            type: 'equals',
            value: 'Cart >= 0'
        });

        const shippingMethod = () => this.search('shipping-method', {
            field: 'name',
            type: 'equals',
            value: 'Standard'
        });

        return Promise.all([rule(), shippingMethod()])
            .then(([rule, shippingMethod]) => {
                const payload = {
                    availabilityRuleId: rule.id
                }
                return this.apiClient.patch(`/v2/shipping-method/${shippingMethod.id}?_response=true`, payload);
            });
    }
}

module.exports = ShipmentFixture;
global.ShipmentFixtureService = new ShipmentFixture();
