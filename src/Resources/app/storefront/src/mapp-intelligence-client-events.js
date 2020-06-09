/* eslint-disable import/no-unresolved */
import Plugin from 'src/plugin-system/plugin.class.js';
import DomAccess from 'src/helper/dom-access.helper.js';
// import DomIterator from 'src/helper/iterator.helper.js';

export default class MappIntelligenceClientEvents extends Plugin {
    init() {
        this.subscribeEvents();
    }

    hiddenInputWithJSONCreator(element, dataObject) {
        console.log('plugin - ', element, dataObject);
    }

    subscribeEvents() {
        var paginations = window.PluginManager.getPluginInstances('ListingPagination');
        paginations.forEach( (element) => {
            element.$emitter.subscribe('change',  (event) => {
                this.paginationHandler(event);
            });
        });

        const filterPlugins = [
            'FilterBoolean',
            'FilterMultiSelect',
            'FilterPropertySelect',
            'FilterRange',
            'FilterRating'

        ];
        filterPlugins.forEach( (filterType) => {
            var filters = window.PluginManager.getPluginInstances(filterType);
            filters.forEach( (element) => {
                element.$emitter.subscribe('change',  (event) => {
                    this.filterHandler(event, filterType);
                });
            });
        });

        var filters = window.PluginManager.getPluginInstances('FilterRange');
        filters.forEach( (element) => {
            element.$emitter.subscribe('change',  (event) => {
                this.filterHandler(event);
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
            console.log('MAPP -> switch page: ', page)
        } else if (sorting) {
            console.log('MAPP -> switch sorting: ', sorting)
        }
    }

    filterHandler(event, filterType) {
        const output = { filterType };
        switch (filterType) {
            case 'FilterBoolean':
                break;
            case 'FilterMultiSelect':
            case 'FilterPropertySelect':
                output.filterValue = event.target.dataset.label;
                break;
            case 'FilterRange':
                break;
            case 'FilterRating':
                break;
        }

        if(filterType) { // will be undefined when using range
            // TODO implement filters
        }
    }

    addToCartHandler(event) {

        console.log('MAPP -> add-to-cart event -> ', event);

        var trackingData = {...DomAccess.querySelector(event.target, '.mapp-tracking-data', true).dataset};
        trackingData.quantity = event.target.elements['lineItems[' + trackingData.productShopwareId + '][quantity]'].value;
        trackingData.productPrice = trackingData.quantity * trackingData.productPrice;
        console.log('MAPP -> add-to-cart data -> ', trackingData);
    }

}
