// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
Cypress.Commands.add("interceptTracking", () => {
	cy.intercept("*/*wt-eu02.net/136699033798929/wt?p=*").as("trackRequest");
});
Cypress.Commands.add("interceptAddRequest", () => {
	cy.intercept("*/*wt-eu02.net/136699033798929/wt?p=*&st=add*").as("addTrackRequest");
});

Cypress.Commands.add("testTrackRequest", () => {
	return cy.wait("@trackRequest").then((interception) => {
		const url = interception.request.url;
		const urlSearchParams = new URLSearchParams(url);
		const isSmartpixel = /136699033798929\/wt\?p=6/.test(
			interception.request.url
		);
		const pageName = decodeURIComponent(
			/136699033798929\/wt\?p=\d{3},(.+?),/.exec(
				interception.request.url
			)[1]
		);
		return {
			params: Object.fromEntries(urlSearchParams.entries()),
			version: isSmartpixel ? "6" : "5",
			pageName,
		};
	});
});

Cypress.Commands.add("testAddTrackRequest", () => {
	return cy.wait("@addTrackRequest").then((interception) => {
		const url = interception.request.url;
		const urlSearchParams = new URLSearchParams(url);
		const isSmartpixel = /136699033798929\/wt\?p=6/.test(
			interception.request.url
		);
		const pageName = decodeURIComponent(
			/136699033798929\/wt\?p=\d{3},(.+?),/.exec(
				interception.request.url
			)[1]
		);
		return {
			params: Object.fromEntries(urlSearchParams.entries()),
			version: isSmartpixel ? "6" : "5",
			pageName,
		};
	});
});

Cypress.on("uncaught:exception", (err, runnable) => {
	// returning false here prevents Cypress from
	// failing the test
	return false;
});
