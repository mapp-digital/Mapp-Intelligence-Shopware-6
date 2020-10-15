/* eslint-disable import/no-unresolved */
/* global _tiConfig */
/* eslint no-undef: "error" */
import Plugin from 'src/plugin-system/plugin.class.js';
import DomAccess from 'src/helper/dom-access.helper.js';
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';
// import DomIterator from 'src/helper/iterator.helper.js';

export default class MappIntelligenceClientEvents extends Plugin {
    init() {
        this.subscribeEvents();
    }

    subscribeEvents() {
        document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, this.loadTiLoader);

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
                element.$emitter.subscribe('change',  () => {
                    this.updateAddToCart();
                    const resetButton = document.querySelector('.filter-reset-all');
                    if(resetButton) {
                        setTimeout(() => {
                            resetButton.addEventListener('click', () => {
                                this.updateAddToCart();
                            });
                        },500);
                    }
                });
            });
        });

        this.subscribeAddToCart();
    }

    loadTiLoader(updatedCookies) {
        if (updatedCookies.detail.sw_MappIntelligence) {
            (function(a,d,c,f){a.wts=a.wts||[];var g=function(b){var a='';b.customDomain&&b.customPath?a=b.customDomain+'/'+b.customPath:b.tiDomain&&b.tiId&&(a=b.tiDomain+'/resp/api/get/'+b.tiId+'?url='+encodeURIComponent('https://'+d.location.host+'/')+'&v=5');if(b.option)for(var c in b.option)a+='&'+c+'='+encodeURIComponent(b.option[c]);return a};if(-1===d.cookie.indexOf('wt_r=1')){var e=d.getElementsByTagName(c)[0];c=d.createElement(c);c.async=!0;c.onload=function(){if('undefined'!==typeof a.wt_r&&!isNaN(a.wt_r)){var b= new Date; var c=b.getTime()+1E3*parseInt(a.wt_r);b.setTime(c);d.cookie='wt_r=1;path=/;expires='+b.toUTCString()}};c.onerror=function(){'undefined'!==typeof a.wt_mcp_hide&&'function'===typeof a.wt_mcp_hide.show&&(a.wt_mcp_hide.show(),a.wt_mcp_hide.show=function(){})};c.src='//'+g(f);e.parentNode.insertBefore(c,e)}})(window,document,'script',_tiConfig);
        }
    }

    subscribeAddToCart() {
        var addToCarts = window.PluginManager.getPluginInstances('AddToCart');
        addToCarts.forEach( (element) => {
            element.$emitter.subscribe('beforeFormSubmit',  (event) => {
                this.addToCartHandler(event);
            });
        });
    }

    updateAddToCart() {
        var oldAddToCartLength = window.PluginManager.getPluginInstances('AddToCart').length;
        var intervalId = setInterval(() => {
            var currentAddToCartAmounts = window.PluginManager.getPluginInstances('AddToCart').length;
            if(currentAddToCartAmounts !== oldAddToCartLength) {
                this.subscribeAddToCart();
                clearInterval(intervalId);
            }
        },500);
    }




    paginationHandler(event) {
        const page = event.target.getAttribute('value');

        let sorting = null;
        if(event.target.options) {
            const selectedFilterOption = event.target.options.selectedIndex;
            sorting = event.target.options[selectedFilterOption].innerText;
        }
        this.updateAddToCart();
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
        var backup = JSON.stringify(window._ti);
        var trackingData = { ...DomAccess.querySelector(event.target, '.mapp-tracking-data', true).dataset };
        if(trackingData.productQuantity && trackingData.productShopwareId) {
            trackingData.productQuantity = event.target.elements['lineItems[' + trackingData.productShopwareId + '][quantity]'].value;
        }
        if(trackingData.productCost && trackingData.productQuantity) {
            trackingData.productCost = (trackingData.productQuantity * trackingData.productCost).toFixed(2);
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
            if(window._ti.hasOwnProperty('contentSubcategory') && window._ti.contentSubcategory !== 'Product Detail') {
                const backup2 = JSON.stringify(window._ti);
                window._ti.shoppingCartStatus = 'view';
                window._ti.productQuantity = '1';
                window.wts.push(['send', 'pageupdate']);
                window._ti = JSON.parse(backup2);
            }
            setTimeout( () => {
                window.wts.push(['send', 'pageupdate']);
                window._ti = JSON.parse(backup);
            }, 50);
        }
    }
}
