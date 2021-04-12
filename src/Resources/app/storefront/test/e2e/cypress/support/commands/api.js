const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

/**
 * Calls the admin API
 * @memberOf Cypress.Chainable#
 * @name createCategory
 * @function
 * @param {String} requestType - get, post, patch etc.
 * @param {String} url - API endpoint / route
 * @param {Object} body - Request body
 */
Cypress.Commands.add('callAdminApi', (requestType, url, body = {}) => {
    class AdminApi extends AdminFixtureService {
        run(requestType, url, body) {
            return this.apiClient[requestType](url, body);
        }
    }
    const api = new AdminApi();
    return api.run(requestType, url, body);
});
