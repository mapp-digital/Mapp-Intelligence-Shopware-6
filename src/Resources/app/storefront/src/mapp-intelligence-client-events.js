/* eslint-disable import/no-unresolved */
import Plugin from 'src/plugin-system/plugin.class.js';
import DomAccess from 'src/helper/dom-access.helper.js';
// import DomIterator from 'src/helper/iterator.helper.js';

export default class MappIntelligenceClientEvents extends Plugin {
    init() {
        this.subscribeEvents();
    }

    subscribeEvents() {
        var paginations = window.PluginManager.getPluginInstances('ListingPagination');
        paginations.forEach( (element) => {
            element.$emitter.subscribe('change',  (event) => {
                this.paginationHandler(event);
            });
        });

        var searchWidgets = window.PluginManager.getPluginInstances('SearchWidget');
        searchWidgets.forEach( (element) => {
            element.$emitter.subscribe('afterSuggest',  (event) => {
                this.searchWidgetHandler(event);
            });
        });
        var addToCarts = window.PluginManager.getPluginInstances('AddToCart');
        addToCarts.forEach( (element) => {
            element.$emitter.subscribe('beforeFormSubmit',  (event) => {
                this.addToCartHandler(event);
            });
        });
    }

    paginationHandler(event) {
        const page = event.target.getAttribute('value');

        let sorting = null;
        if(event.target.options) {
            const selectedFilterOption = event.target.options.selectedIndex;
            sorting = event.target.options[selectedFilterOption].innerText;
        }
        if(page) {
            if(window.wts && window._ti.pageNumber) {
                window._ti.pageNumber = page;
                window.wts.push(['send', 'pageupdate']);
            }
        } else if (sorting) {
            if(window.wts) {
                window.wts.push(['send', 'click', { linkId: 'Sorting: ' + sorting }]);
            }
        }
    }

    searchWidgetHandler() {
        if(window.wts) {
            window.wts.push(['linkTrackInstall']);
        }
    }

    addToCartHandler(event) {
        var trackingData = { ...DomAccess.querySelector(event.target, '.mapp-tracking-data', true).dataset };
        if(trackingData.productQuantity) {
            trackingData.productQuantity = event.target.elements['lineItems[' + trackingData.productShopwareId + '][quantity]'].value;
        }
        if(trackingData.productCost && trackingData.productQuantity) {
            trackingData.productCost = trackingData.productQuantity * trackingData.productCost;
        }
        if(trackingData.productCategories) {
            trackingData.productCategories = JSON.parse(trackingData.productCategories);
            if(trackingData.productCategories[0]) {
                trackingData.productCategory = trackingData.productCategories[0];
            }
            if(trackingData.productCategories[1]) {
                trackingData.productSubCategory = trackingData.productCategories[1];
            }
        }
        window._ti = {...window._ti, ...trackingData}
        if(window.wts) {
            window.wts.push(['send', 'pageupdate']);
        }
    }
}
