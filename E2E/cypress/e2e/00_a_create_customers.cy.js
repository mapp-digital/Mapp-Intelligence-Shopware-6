// / <reference types="Cypress" />

describe("MappIntelligencePluginTests: Customer preparations", () => {
  const maleCustomerId = "555aee2d4ef6484f99e541a03976d867";
  const femaleCustomerId = "666aee2d4ef6484f99e541a03976d867";
  const unknownCustomerId = "777aee2d4ef6484f99e541a03976d867";

  const customers = {
    male: {
      id: maleCustomerId,
      addressId: "aaa00000000000000000000000000001",
      customerNumber: "MAPP-CUST-001",
      firstName: "Testuser1",
      lastName: "Male",
      email: "male@mapp-example.de",
      password: "shopware",
      street: "abc street",
      postalCode: "12345",
      city: "Berlin",
      countryIso: "DE", // Germany
      salutationKey: "Mr.",
      birthday: { day: "1", month: "1", year: "1970" }
    },
    female: {
      id: femaleCustomerId,
      addressId: "aaa00000000000000000000000000002",
      customerNumber: "MAPP-CUST-002",
      firstName: "Testuser2",
      lastName: "Female",
      email: "female@mapp-example.de",
      password: "shopware",
      street: "def street",
      postalCode: "56789",
      city: "Paris",
      countryIso: "FR", // France
      salutationKey: "Mrs.",
      birthday: { day: "1", month: "1", year: "1970" }
    },
    unknown: {
      id: unknownCustomerId,
      addressId: "aaa00000000000000000000000000003",
      customerNumber: "MAPP-CUST-003",
      firstName: "Testuser3",
      lastName: "Unknown",
      email: "unknown@mapp-example.de",
      password: "shopware",
      street: "hij street",
      postalCode: "54321",
      city: "London",
      countryIso: "GB", // UK
      salutationKey: "Not specified",
      birthday: { day: "1", month: "1", year: "1970" }
    }
  };

  const getSalesChannelId = () => {
    return cy.callAdminApi("post", "/search/sales-channel", {
      page: 1,
      limit: 25,
      term: "Storefront",
      "total-count-mode": 1
    });
  };

  const getSalutationId = (displayName) => {
    return cy.callAdminApi("post", "/search/salutation", {
      filter: [{ type: "equals", field: "displayName", value: displayName }],
      limit: 1
    }).then((res) => res.id);
  };

  const getCountryId = (isoCode) => {
    return cy.callAdminApi("post", "/search/country", {
      filter: [{ type: "equals", field: "iso", value: isoCode }],
      limit: 1
    }).then((res) => res.id);
  };

  const createCustomer = (cust) => {
    return getSalutationId(cust.salutationKey).then((salutationId) => {
      return getCountryId(cust.countryIso).then((countryId) => {
        return cy.callAdminApi("post", "/customer", {
          id: cust.id,
          customerNumber: cust.customerNumber,
          firstName: cust.firstName,
          lastName: cust.lastName,
          email: cust.email,
          password: cust.password,
          salutationId,
          birthday: `${cust.birthday.year}-${String(cust.birthday.month).padStart(2, "0")}-${String(cust.birthday.day).padStart(2, "0")}`,
          defaultPaymentMethodId: "b7d2554b0ce847cd82f3ac9bd1c0dfca", // Invoice
          groupId: "cfbd5018d38d41d8adca10d94fc8bdd6", // Default customer group
          salesChannelId: cust.salesChannelId,
          defaultBillingAddressId: cust.addressId,
          defaultShippingAddressId: cust.addressId,
          addresses: [
            {
              id: cust.addressId,
              firstName: cust.firstName,
              lastName: cust.lastName,
              street: cust.street,
              zipcode: cust.postalCode,
              city: cust.city,
              countryId,
              salutationId
            }
          ]
        });
      });
    });
  };

  it("create male, female & unknown customers", () => {
    getSalesChannelId().then((salesChannel) => {
      const scId = salesChannel.id;
      Object.values(customers).forEach((cust) => {
        cust.salesChannelId = scId;
        createCustomer(cust);
      });
    });
  });
});
