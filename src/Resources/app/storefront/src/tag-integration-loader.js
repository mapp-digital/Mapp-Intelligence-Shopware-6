export const loadTi = (tiId, tiDomain, dataLayerVariableName) => {

    const _tiConfig = window._tiConfig || {
        tiDomain,
        tiId,
        option: {}
    };
    (function(a,d,c,f){a.wts=a.wts||[];var g=function(b){var a='';b.customDomain&&b.customPath?a=b.customDomain+'/'+b.customPath:b.tiDomain&&b.tiId&&(a=b.tiDomain+'/resp/api/get/'+b.tiId+'?url='+encodeURIComponent('https://'+d.location.host+'/')+'&v=5');if(b.option)for(var c in b.option)a+='&'+c+'='+encodeURIComponent(b.option[c]);return a};if(-1===d.cookie.indexOf('wt_r=1')){var e=d.getElementsByTagName(c)[0];c=d.createElement(c);c.async=!0;c.onload=function(){if('undefined'!==typeof a.wt_r&&!isNaN(a.wt_r)){var b=
        new Date; var c=b.getTime()+1E3*parseInt(a.wt_r);b.setTime(c);d.cookie='wt_r=1;path=/;expires='+b.toUTCString()}};c.onerror=function(){'undefined'!==typeof a.wt_mcp_hide&&'function'===typeof a.wt_mcp_hide.show&&(a.wt_mcp_hide.show(),a.wt_mcp_hide.show=function(){})};c.src='//'+g(f);e.parentNode.insertBefore(c,e)}})(window,document,'script',_tiConfig);

    const productKeys = [
        'productCost',
        'productShopwareId',
        'productName',
        'productQuantity'
    ];
    productKeys.forEach((productKey) => {
        window[dataLayerVariableName][productKey] = '';
        window[dataLayerVariableName].products.forEach((product) => {
            window[dataLayerVariableName][productKey] += ';' + product[productKey];
        });
    });


}
