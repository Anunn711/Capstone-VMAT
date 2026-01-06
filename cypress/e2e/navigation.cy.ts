/**
 * Navigation Tests
 * 
 * Tests sidebar navigation and routing throughout the application
 */

describe('Application Navigation', () => {
    beforeEach(() => {
        cy.login('admin', 'password');
    });

    it('should navigate from dashboard to awaiting review', () => {
        cy.visit('/dashboard');
        cy.contains('a.nav-link, button', 'Awaiting Review').click();
        cy.url().should('include', '/awaiting-review');
    });

    it('should navigate to vulnerability catalog', () => {
        cy.visit('/dashboard');
        cy.contains('a.nav-link, button', 'Vulnerability Catalog').click();
        cy.url().should('include', '/vulnerability-catalog');
    });

    it('should navigate to mitigations page', () => {
        cy.visit('/dashboard');
        cy.contains('a.nav-link, button', 'Mitigations').click();
        cy.url().should('include', '/mitigations');
    });

    it('should navigate to system logs', () => {
        cy.visit('/dashboard');
        cy.contains('button', 'System Logging').click();
        cy.url().should('include', '/system-logs');
    });

    it('should highlight active navigation link', () => {
        cy.visit('/dashboard');
        cy.contains('a.nav-link', 'Dashboard').should('have.class', 'active');
    });
});
