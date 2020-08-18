const ShipmentFixture = require("../service/shipment.fixture");

/**
 * Sometimes SW sets Standard shipment to rule
 * Sunday only. This command shall fix that.
 * @memberOf Cypress.Chainable#
 * @name fixShipment
 * @function
 */
Cypress.Commands.add('fixShipment', () => {
    const fixture = new ShipmentFixture();
    fixture.setShipmentFixture().then(()=>{});
});
