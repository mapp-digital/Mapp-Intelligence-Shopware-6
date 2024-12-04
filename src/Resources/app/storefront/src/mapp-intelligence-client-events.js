/* eslint-disable import/no-unresolved */
/* global _tiConfig */
/* eslint no-undef: "error" */
import DomAccess from 'src/helper/dom-access.helper.js';
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';
// import DomIterator from 'src/helper/iterator.helper.js';

export default class MappIntelligenceClientEvents extends window.PluginBaseClass {
    cartItems = [];
    skipOnOpenCartRequest = false;

    init() {
        this._subscribeEvents();
        this._handleCheckoutCartAndConfirmPages();
        this._handleWishlistPage();
        this._addClickListenerToWishlistIcons(true);
    }

    /**
     * If a user is not logged in, an add-wl request will
     * be initiated if you click the wishlist button
     *
     * @param {boolean} [allItems = false] 
     * 
     * @private
     */
    _addClickListenerToWishlistIcons(allItems = false) {
        if(!window._ti.userLoggedIn) {
            const products = this._getProductData(allItems);
            products.forEach((product) => {
                const selector = `.product-wishlist-${product.productShopwareId}`;
                [...document.querySelectorAll(selector)].forEach(el => {
                    el.addEventListener("click", ()=> {
                        this._fireProductEvent(product, "add-wl", "wishlist");
                    }, {once : true});
                });
            });
        }
    }

    /**
     * Initiates del-wl request when wishlist item 
     * is removed on wishlist page
     * 
     * @private
     */
    _handleWishlistPage() {
        if(window._ti.shopwareRoute === 'frontend.wishlist.page') {
            const products = this._getProductData(true);
            products.forEach(product => {
                const selector = `form[action="/wishlist/product/delete/${product.productShopwareId}"]`;
                document.querySelector(selector).addEventListener("submit", () => {
                    this._fireProductEvent(product, "del-wl", "wishlist");
                });
            });
        }
    }

    /**
     * Initiates all requests when products
     * are added / removed / to or from cart
     * on checkout/cart and checkout/confirm pages
     * 
     * @private
     */
    _handleCheckoutCartAndConfirmPages() {
        if(window._ti.shopwareRoute === 'frontend.checkout.cart.page' || window._ti.shopwareRoute === 'frontend.checkout.confirm.page') {  
            const products = this._getProductData(true);
            const propableAddToCartNumber = window.sessionStorage.getItem("swMappCartAdd");
            if(propableAddToCartNumber) {
                window.sessionStorage.removeItem("swMappCartAdd");
                const addedProduct = products.find(p => p.productId === propableAddToCartNumber);
                if(addedProduct) {
                    setTimeout(() => {
                        this._fireProductEvent(addedProduct, "add", "add-to-cart");
                    }, 500);
                } 
            }

            const autoForms = window.PluginManager.getPluginInstances('FormAutoSubmit');
            autoForms.forEach( (element) => {
                element.$emitter.subscribe('beforeChange',  (event) => {
                    const formData = [...new FormData(event.target).entries()];
                    const changeQuantityPath = '/checkout/line-item/change-quantity/';
                    const formAction = element.el.getAttribute('action');
                    if(formAction.includes(changeQuantityPath)) {
                        const productId = formAction.replace(changeQuantityPath, '');
                        const product = this._getProductById(productId, products);
                        const newQuantity = Number(formData.find(f => f[0] === 'quantity')[1]);
                        const oldQuantity = Number(product.productQuantity);
                        if(newQuantity > oldQuantity) {
                            this._fireProductEvent(product, "add", "add-to-cart", newQuantity - oldQuantity);
                        } else if( oldQuantity > newQuantity) {
                            this._fireProductEvent(product, "del", "delete-from-cart", oldQuantity - newQuantity);
                        }
                    }
                });
            });

            products.forEach((product) => {
                const selector = `form[action="/checkout/line-item/delete/${product.productShopwareId}"`;
                document.querySelector(selector).addEventListener("submit", () => {
                    this._fireProductEvent(product, "del", "delete-from-cart", product.productQuantity);
                });
            });

            [...document.querySelectorAll("form[action='/checkout/product/add-by-number']")].forEach(formEl => {
                formEl.addEventListener("submit", (event) => {
                    let data = new FormData(event.target);
                    data = [...data.entries()].find(d=>d[0]==='number')[1];
                    window.sessionStorage.setItem("swMappCartAdd", data);
                });
            });
        }
    }

    /**
     * Adds event listeners to various plugins
     * and invokes corresponding methods
     * 
     * @private
     */
    _subscribeEvents() {
        document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, this._loadTiLoader);

        const paginations = window.PluginManager.getPluginInstances('ListingPagination');
        paginations.forEach( (element) => {
            element.$emitter.subscribe('change',  (event) => {
                this._paginationHandler(event);
            });
        });

        const searchWidgets = window.PluginManager.getPluginInstances('SearchWidget');
        searchWidgets.forEach( (element) => {
            element.$emitter.subscribe('afterSuggest',  (event) => {
                this._searchWidgetHandler(event);
            });
        });

        const offCanvasCart = window.PluginManager.getPluginInstances('OffCanvasCart');
        offCanvasCart.forEach( (element) => {
            element.$emitter.subscribe('registerEvents',  () => {
                this.cartItems = this._getProductData();
            });
            element.$emitter.subscribe('offCanvasOpened',  () => {
                this._addClickListenerToWishlistIcons();
                if(this.skipOnOpenCartRequest) {
                    this.skipOnOpenCartRequest = false;
                } else {
                    this._changeCartHandler();
                }
            });
        });

        const allPlugins = Object.keys(PluginManager.getPluginList());
        if(allPlugins.includes('WishlistStorage')) {
            const wishlistStorage =  window.PluginManager.getPluginInstances('WishlistStorage');
            wishlistStorage.forEach( (element) => {
                element.$emitter.subscribe('Wishlist/onProductAdded',  (event) => {
                    this._wishlistHandler(event, 'add-wl')
                });
                element.$emitter.subscribe('Wishlist/onProductRemoved',  (event) => {
                    this._wishlistHandler(event, 'del-wl')
                });
            });
        }

        let filterPlugins = [
            'FilterBoolean',
            'FilterMultiSelect',
            'FilterPropertySelect',
            'FilterRange',
            'FilterRating',
            'FilterRatingSelect'
        ];
        const pluginList = window.PluginManager.getPluginList();
        filterPlugins = filterPlugins.filter((filterType) => pluginList.hasOwnProperty(filterType));
        filterPlugins.forEach( (filterType) => {
            var filters = window.PluginManager.getPluginInstances(filterType);
            filters.forEach( (element) => {
                element.$emitter.subscribe('change',  () => {
                    this._updateAddToCart();
                    const resetButton = document.querySelector('.filter-reset-all');
                    if(resetButton) {
                        setTimeout(() => {
                            resetButton.addEventListener('click', () => {
                                this._updateAddToCart();
                            });
                        },500);
                    }
                });
            });
        });

        this._subscribeAddToCart();
    }

    
    /**
     * Adds product data to _ti, fires pageupdate
     * and then restores _ti to original state
     *
     * @param {Object} product
     * @param {('add'|'del'|'del-wl'|'add-wl')} stParam
     * @param {string} ctParam
     * @param {string} [quantity = "1"]
     * 
     * @private
     */
    _fireProductEvent(product, stParam, ctParam, quantity = "1") {
        const backup = JSON.stringify(window._ti);
        product.productQuantity = quantity;
        product.productCost = (quantity * product.productCost).toFixed(2);
        if(product.productCategories) {
            if(product.productCategories[0]) {
                product.productCategory = product.productCategories[0];
            }
            if(product.productCategories[1]) {
                product.productSubCategory = product.productCategories[1];
            }
        }
        product.shoppingCartStatus = stParam;
        window._ti = {... window._ti, ...product};
        window.wts.push(['linkId', window._ti[stParam] || ctParam]);
        window.wts.push(['send', 'pageupdate', true]);
        this._restoreDatalayer(backup);
    }

    
    /**
     * Uses JSON string backup of old _ti
     * to restore old _ti state. All keys of current state are
     * set to "false" to get them out of the next request
     *
     * @param {string} backup
     * 
     * @private
     */
    _restoreDatalayer(backup) {
        setTimeout(() => {
            window.wts.push(['linkId', 'false']);
            Object.keys(window._ti).forEach(key => {
                window._ti[key] = "false";
            });
            window._ti = {...window._ti, ...JSON.parse(backup)};
        }, 500);
    }

    /**
     * Reads product data from DOM elements
     * which are added via twig. No arguments reads 
     * elements of offCanvas cart only, argument true 
     * reads all (product boxes etc.)
     *
     * @param {boolean} [allElements = false]
     * @return {Array}
     * 
     * @private
     */
    _getProductData(allElements = false) {
        let elements = [...document.querySelectorAll('.mapp-tracking-data-cart')];
        if(allElements) {
            elements = [...document.querySelectorAll('.mapp-tracking-data'), ...elements];
        }
        return elements.map(e => {
            let productCategories = [];
            try {
                productCategories = JSON.parse(e.dataset.productCategories);
            } catch (error) {
                // do nothing
            }
            return {...e.dataset, productCategories }
        });
    }

    /**
     * Returns product from product
     * array based in id, reads products
     * from DOM if no array is given
     *
     * @param {string} id
     * @param {Array} [products = Array]
     * @returns {(Object|false)}
     * 
     * @private
     */
    _getProductById(id, products = this._getProductData(true)) {
        const index = products.findIndex((product) => id === product.productShopwareId)
        if(index === -1) {
            return false;
        } else {
            return products[index];
        }
    }

    /**
     * Compares the old and the new cart state
     * and initiates add / del requests if quantity 
     * or existence is different between old and new.
     * 
     * @private
     */
    _changeCartHandler() {
        const newCart = this._getProductData();
        this.cartItems.forEach((item, oldCartIndex) => {
            const index = newCart.findIndex(i => i.productShopwareId === item.productShopwareId);
            if(index === -1) {
                this._fireProductEvent(item, 'del', 'remove-from-cart', item.productQuantity);
            } else {
                const oldQuantity = Number(this.cartItems[oldCartIndex].productQuantity);
                const newQuantity = Number(newCart[index].productQuantity);
                if(newQuantity > oldQuantity) {
                    this._fireProductEvent(newCart[index], 'add', 'add-to-cart', newQuantity-oldQuantity);
                } else if (oldQuantity > newQuantity) {
                    this._fireProductEvent(newCart[index], 'del', 'delete-from-cart', oldQuantity-newQuantity);
                }
            }
        });
        this.cartItems = newCart;
    }

    /**
     * Initiates wl requests based on the event and given status
     *
     * @param {Event} event
     * @param {('add-wl'|'del-wl')} status
     * 
     * @private
     */
    _wishlistHandler(event, status) {
        const product = this._getProductById(event.detail.productId)
        this._fireProductEvent(product, status, "wishlist");
    }

    /**
     * Loads Tag Integration loader.
     *
     * @param {Event} updatedCookies
     * 
     * @private
     */
    _loadTiLoader(updatedCookies) {
        if (updatedCookies.detail.sw_MappIntelligence) {
            (function(a,d,c,f){a.wts=a.wts||[];var g=function(b){var a='';b.customDomain&&b.customPath?a=b.customDomain+'/'+b.customPath:b.tiDomain&&b.tiId&&(a=b.tiDomain+'/resp/api/get/'+b.tiId+'?url='+encodeURIComponent('https://'+d.location.host+'/')+'&v=5');if(b.option)for(var c in b.option)a+='&'+c+'='+encodeURIComponent(b.option[c]);return a};if(-1===d.cookie.indexOf('wt_r=1')){var e=d.getElementsByTagName(c)[0];c=d.createElement(c);c.async=!0;c.onload=function(){if('undefined'!==typeof a.wt_r&&!isNaN(a.wt_r)){var b= new Date; var c=b.getTime()+1E3*parseInt(a.wt_r);b.setTime(c);d.cookie='wt_r=1;path=/;expires='+b.toUTCString()}};c.onerror=function(){'undefined'!==typeof a.wt_mcp_hide&&'function'===typeof a.wt_mcp_hide.show&&(a.wt_mcp_hide.show(),a.wt_mcp_hide.show=function(){})};c.src='//'+g(f);e.parentNode.insertBefore(c,e)}})(window,document,'script',_tiConfig);
        }
    }

    /**
     * Subscribes to all AddToCart - beforeFormSubmit events
     * and invokes handler
     * 
     * @private
     */
    _subscribeAddToCart() {
        var addToCarts = window.PluginManager.getPluginInstances('AddToCart');
        addToCarts.forEach( (element) => {
            element.$emitter.subscribe('beforeFormSubmit',  (event) => {
                this._addToCartHandler(event);
            });
        });
    }

    /**
     * Checks if new AddToCart Instances have been added,
     * for example after pagination, and invokes subscriber
     * 
     * @private
     */
    _updateAddToCart() {
        var oldAddToCartLength = window.PluginManager.getPluginInstances('AddToCart').length;
        var intervalId = setInterval(() => {
            var currentAddToCartAmounts = window.PluginManager.getPluginInstances('AddToCart').length;
            if(currentAddToCartAmounts !== oldAddToCartLength) {
                this._subscribeAddToCart();
                clearInterval(intervalId);
            }
        },500);
    }

    /**
     * Fired after page changed, invokes reindexing of 
     * new AddToCart elements and fires trackrequests
     *
     * @param {Event} event
     * 
     * @private
     */
    _paginationHandler(event) {
        const page = event.target.getAttribute('value');

        let sorting = null;
        if(event.target.options) {
            const selectedFilterOption = event.target.options.selectedIndex;
            sorting = event.target.options[selectedFilterOption].innerText;
        }
        this._updateAddToCart();
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

    /**
     * Reindexes links via pixel
     * 
     * @private
     */
    _searchWidgetHandler() {
        if(window.wts) {
            window.wts.push(['linkTrackInstall']);
        }
    }

    /**
     * Reads product data from DOM elements
     * and fires trackrequests
     *
     * @param {Event} event
     * 
     * @private
     */
    _addToCartHandler(event) {
        this.skipOnOpenCartRequest = true;
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
                this._restoreDatalayer(backup);
            }, 500);
        }
    }
}
