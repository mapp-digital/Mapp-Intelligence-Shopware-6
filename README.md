# Shopware 6 - Mapp Cloud Extension

[Site](https://mapp.com/) |
[Docs](https://documentation.mapp.com/1.0/en/shopware-6-19109849.html) |
[Support](https://documentation.mapp.com/) |
[Changelog](https://github.com/mapp-digital/Mapp-Intelligence-Shopware-6/blob/main/CHANGELOG.md)

The Shopware 6 Mapp Cloud extension lets you implement Tag Integration in your Shopware 6 Storefront Shop. The plugin

- loads the tiLoader.
- provides a _ti dataLayer object.
- automatically indexes links of AJAX search results for automatic link tracking and
- in addition to the page requests after page loads, a PI is fired when adding a product to the cart, when changing the page on product listing pages or search result pages, and an event request when sorting product listings.
- if a product is added to cart outside of a product detail page, a product view request is fired right before the add to cart request - use dataLayer attribute 'pageRequestType' to filter those PIs and get the 'real' page impressions
