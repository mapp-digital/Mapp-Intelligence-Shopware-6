// Sets up the shop for the E2E tests: storefront URL, coupon, landing page, categories, products, customers.
// Runs in the Cypress container before the tests (make seed). All records have fixed ids and are upserted,
// so the script can run again on the same shop.
const crypto = require("crypto");
const { AdminApi, fetchPage } = require("./admin-api");

const api = new AdminApi();
const STOREFRONT_URL = "http://shopware.test";

// stable id for records the tests do not refer to by id
const idFor = (name) => crypto.createHash("md5").update(`mapp-e2e-${name}`).digest("hex");

const CATEGORY_ID = "111aee2d4ef6484f99e541a03976d865";
const SUBCATEGORY_ID = "111aee2d4ef6484f99e541a03976d867";

const CUSTOMERS = [
  {
    id: "555aee2d4ef6484f99e541a03976d867",
    addressId: "aaa00000000000000000000000000001",
    customerNumber: "MAPP-CUST-001",
    firstName: "Testuser1",
    lastName: "Male",
    email: "male@mapp-example.de",
    street: "abc street",
    zipcode: "12345",
    city: "Berlin",
    countryIso: "DE",
    salutation: "Mr.",
  },
  {
    id: "666aee2d4ef6484f99e541a03976d867",
    addressId: "aaa00000000000000000000000000002",
    customerNumber: "MAPP-CUST-002",
    firstName: "Testuser2",
    lastName: "Female",
    email: "female@mapp-example.de",
    street: "def street",
    zipcode: "56789",
    city: "Paris",
    countryIso: "FR",
    salutation: "Mrs.",
  },
  {
    id: "777aee2d4ef6484f99e541a03976d867",
    addressId: "aaa00000000000000000000000000003",
    customerNumber: "MAPP-CUST-003",
    firstName: "Testuser3",
    lastName: "Unknown",
    email: "unknown@mapp-example.de",
    street: "hij street",
    zipcode: "54321",
    city: "London",
    countryIso: "GB",
    salutation: "Not specified",
  },
];

async function step(name, fn) {
  const start = Date.now();
  process.stdout.write(`- ${name} ... `);
  const result = await fn();
  console.log(`done (${Date.now() - start} ms)`);
  return result;
}

async function setStorefrontUrl(storefront) {
  // the http domain is the one the tests use; dockware comes with http://localhost
  const domain = storefront.domains.find((d) => d.url.startsWith("http://")) || storefront.domains[0];
  await api.upsert("sales_channel_domain", [{ id: domain.id, url: STOREFRONT_URL }]);
}

async function createPromotion(storefront) {
  const id = idFor("promotion");
  await api.upsert("promotion", [
    {
      id,
      name: "MappCoupon",
      active: true,
      useCodes: true,
      code: "mapptest",
      useIndividualCodes: false,
      discounts: [
        {
          id: idFor("promotion-discount"),
          scope: "cart",
          type: "absolute",
          value: 3,
          considerAdvancedRules: false,
          sorterKey: "PRICE_ASC",
          applierKey: "ALL",
          usageKey: "ALL",
        },
      ],
      salesChannels: [{ id: idFor("promotion-sales-channel"), salesChannelId: storefront.id, priority: 1 }],
    },
  ]);
}

async function createLandingPage(storefront) {
  // the imprint layout becomes the landing page layout
  const [imprint] = await api.search("cms-page", { limit: 1, term: "Imprint" });
  if (!imprint) throw new Error('No cms page "Imprint" found');
  await api.upsert("cms_page", [{ id: imprint.id, type: "landingpage" }]);
  await api.upsert("landing_page", [
    {
      id: idFor("landing-page"),
      name: "Testlandingpage",
      url: "mapp",
      active: true,
      cmsPageId: imprint.id,
      salesChannels: [{ id: storefront.id }],
    },
  ]);
}

async function createCategories() {
  await api.upsert("category", [
    { id: CATEGORY_ID, name: "MappTestProducts", active: true, visible: true },
    { id: SUBCATEGORY_ID, parentId: CATEGORY_ID, name: "MappSubCategory", active: true, visible: true },
  ]);
}

async function createProducts(storefront) {
  const [tax, manufacturer, currency, men] = await Promise.all([
    api.findOne("tax", "name", "Standard rate"),
    api.findOne("product-manufacturer", "name", "shopware AG"),
    api.findOne("currency", "isoCode", "EUR"),
    api.findOne("category", "name", "Men"),
  ]);
  const colours = await api.search("property-group-option", {
    filter: [
      { type: "equalsAny", field: "name", value: ["Blue", "Red"] },
      { type: "equals", field: "group.name", value: "colour" },
    ],
  });
  const colourId = (name) => {
    const option = colours.find((o) => o.name === name);
    if (!option) throw new Error(`No colour option "${name}" found`);
    return option.id;
  };

  const product = ({ id, name, productNumber, stock, gross, net, categoryId }) => ({
    id,
    name,
    productNumber,
    stock,
    taxId: tax.id,
    manufacturerId: manufacturer.id,
    price: [{ currencyId: currency.id, gross, net, linked: true }],
    visibilities: [{ id: idFor(`visibility-${id}`), salesChannelId: storefront.id, visibility: 30 }],
    categories: [{ id: categoryId }],
  });

  const variantParent = product({
    id: "444aee2d4ef6484f99e541a03976d867",
    name: "MappIntelligence-Variant-product",
    productNumber: "MAPPVAR",
    stock: 99,
    gross: 295.95,
    net: 290.95,
    categoryId: SUBCATEGORY_ID,
  });
  variantParent.configuratorSettings = ["Blue", "Red"].map((colour) => ({
    id: idFor(`configurator-${colour}`),
    optionId: colourId(colour),
  }));
  variantParent.children = ["Blue", "Red"].map((colour) => ({
    id: idFor(`variant-${colour}`),
    productNumber: `MappIntelligence-Variant-product-${colour}`,
    stock: 99,
    options: [{ id: colourId(colour) }],
  }));

  // 26 products in "Men", so the "Clothing" listing has a second page
  const fillers = [];
  for (let index = 10; index < 36; index++) {
    fillers.push(
      product({
        id: `${index}9aee2d4ef6484f99e541a03976d867`,
        name: `z_MappIntelligence-product ${index}`,
        productNumber: `MAPP2000${index}`,
        stock: 44,
        gross: 95.95 + index,
        net: 90.95 + index,
        categoryId: men.id,
      })
    );
  }

  await api.upsert("product", [
    product({
      id: "222aee2d4ef6484f99e541a03976d867",
      name: "MappIntelligence-product-äöü",
      productNumber: "MAPP10001",
      stock: 44,
      gross: 495.95,
      net: 490.95,
      categoryId: SUBCATEGORY_ID,
    }),
    product({
      id: "333aee2d4ef6484f99e541a03976d867",
      name: "MappIntelligence-product-soldout",
      productNumber: "MAPP100013",
      stock: 0,
      gross: 1.99,
      net: 1,
      categoryId: SUBCATEGORY_ID,
    }),
    variantParent,
    ...fillers,
  ]);
}

async function createCustomers(storefront) {
  const [invoice, customerGroup] = await Promise.all([
    api.findOne("payment-method", "technicalName", "payment_invoicepayment"),
    api.findOne("customer-group", "name", "Standard customer group"),
  ]);
  const customers = [];
  for (const c of CUSTOMERS) {
    const [salutation, country] = await Promise.all([
      api.findOne("salutation", "displayName", c.salutation),
      api.findOne("country", "iso", c.countryIso),
    ]);
    const address = {
      id: c.addressId,
      firstName: c.firstName,
      lastName: c.lastName,
      street: c.street,
      zipcode: c.zipcode,
      city: c.city,
      countryId: country.id,
      salutationId: salutation.id,
    };
    customers.push({
      id: c.id,
      customerNumber: c.customerNumber,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      password: "shopware",
      salutationId: salutation.id,
      birthday: "1970-01-01",
      defaultPaymentMethodId: invoice.id,
      groupId: customerGroup.id,
      salesChannelId: storefront.id,
      defaultBillingAddressId: c.addressId,
      defaultShippingAddressId: c.addressId,
      addresses: [address],
    });
  }
  await api.upsert("customer", customers);
}

async function fixShipping() {
  // the demo data sometimes limits "Standard" to a rule that does not match (e.g. Sunday only), then no order is possible
  const rule = await api.findOne("rule", "name", "Cart >= 0");
  const methods = await api.search("shipping-method", {
    filter: [{ type: "equalsAny", field: "name", value: ["Standard", "Express"] }],
  });
  await api.upsert(
    "shipping_method",
    methods.map((m) => ({ id: m.id, availabilityRuleId: rule.id }))
  );
}

// waits until the storefront shows the seeded data (product pages and the second listing page)
async function waitForStorefront(timeoutMs = 120000) {
  const checks = [
    ["/MappIntelligence-product-aeoeue/MAPP10001", "MappIntelligence-product-äöü"],
    ["/MappIntelligence-Variant-product/MappIntelligence-Variant-product-Red", "MappIntelligence-Variant-product"],
    ["/MappIntelligence-product-soldout/MAPP100013", "MappIntelligence-product-soldout"],
    ["/Clothing/", 'href="?p=2"'],
  ];
  const deadline = Date.now() + timeoutMs;
  for (const [path, text] of checks) {
    for (;;) {
      const res = await fetchPage(path).catch((err) => ({ status: 0, body: String(err) }));
      if (res.status === 200 && res.body.includes(text)) break;
      if (Date.now() > deadline) {
        throw new Error(`${STOREFRONT_URL}${path} does not show "${text}" (last status ${res.status})`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function main() {
  const start = Date.now();
  console.log(`Seeding ${STOREFRONT_URL}`);
  const storefront = await api.findOne("sales-channel", "name", "Storefront", { associations: { domains: {} } });

  await step("storefront URL", () => setStorefrontUrl(storefront));
  await step("promotion MappCoupon (code mapptest)", () => createPromotion(storefront));
  await step("landing page /mapp", () => createLandingPage(storefront));
  await step("categories", () => createCategories());
  await step("products", () => createProducts(storefront));
  await step("customers", () => createCustomers(storefront));
  await step("shipping methods", () => fixShipping());
  await step("wait for storefront", () => waitForStorefront());
  console.log(`Seed finished in ${((Date.now() - start) / 1000).toFixed(1)} s`);
}

main().catch((err) => {
  console.error(`\nSeed failed: ${err.message}`);
  process.exit(1);
});
