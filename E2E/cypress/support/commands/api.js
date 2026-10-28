/**
 * Calls the admin API
 * @memberOf Cypress.Chainable#
 * @name callAdminApi
 * @function
 * @param {String} requestType - get, post, patch etc.
 * @param {String} url - API endpoint / route
 * @param {Object} body - Request body
 * @returns the data of the response (the entity itself if there is exactly one)
 */
Cypress.Commands.add('callAdminApi', (requestType, url, body = {}) => {
    const method = requestType.toUpperCase();
    return cy.request({
        method: 'POST',
        url: '/api/oauth/token',
        body: {
            grant_type: 'password',
            client_id: 'administration',
            scopes: 'write',
            username: 'admin',
            password: 'shopware'
        },
        log: false
    }).then(({ body: auth }) => cy.request({
        method,
        url: `/api/${url.replace(/^\//, '')}`,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${auth.access_token}`
        },
        body: method === 'GET' ? undefined : body
    })).then(({ body: response }) => {
        const data = response && response.data;
        return Array.isArray(data) && data.length === 1 ? data[0] : data;
    });
});
