/* eslint-disable import/no-unresolved */

import HttpClient from 'src/service/http-client.service';

const __superFunc = HttpClient.prototype._registerOnLoaded;
HttpClient.prototype._registerOnLoaded = function (request, callback) {
    __superFunc.call(this, request, callback);
    request.addEventListener('loadend', () => {
        const mappTrackingData = request.getResponseHeader('mapp-intelligence');
        if(mappTrackingData) {
            console.log(JSON.parse(mappTrackingData));
        }
    });
};
