/**
 * Smoke Tests
 * 
 * Fast, basic tests to verify the application loads and core pages are accessible.
 * These tests should run quickly and catch critical failures.
 */

describe('Smoke Test', () => {
    it('should load the application', () => {
        cy.visit('/');
        cy.contains('Login').should('be.visible');
    });

    it('should access all main pages after login', () => {
        cy.login('admin', 'password');

        // Check Dashboard loads
        cy.visit('/dashboard');
        cy.contains('Dashboard').should('be.visible');

        // Check Awaiting Review page loads
        cy.visit('/awaiting-review');
        cy.url().should('include', '/awaiting-review');

        // Check Vulnerability Catalog loads
        cy.visit('/vulnerability-catalog');
        cy.url().should('include', '/vulnerability-catalog');

        // Check Mitigations page loads
        cy.visit('/mitigations');
        cy.url().should('include', '/mitigations');

        // Check System Logs page loads
        cy.visit('/system-logs');
        cy.url().should('include', '/system-logs');
    });

    it('should handle navigation between pages', () => {
        cy.login('admin', 'password');
        cy.visit('/dashboard');

        // Navigate using sidebar
        cy.navigateToPage('awaiting-review');
        cy.url().should('include', '/awaiting-review');

        cy.navigateToPage('vulnerabilities');
        cy.url().should('include', '/vulnerability-catalog');

        cy.navigateToPage('dashboard');
        cy.url().should('include', '/dashboard');
    });

    it('should protect routes when not authenticated', () => {
        // Try to access protected route without login
        cy.visit('/dashboard');

        // Should redirect to login
        cy.url().should('include', '/login');
        cy.contains('Login').should('be.visible');
    });

    it('should successfully logout', () => {
        cy.login('admin', 'password');
        cy.visit('/dashboard');

        cy.logout();

        // Should be redirected to login
        cy.url().should('include', '/login');

        // Should not be able to access protected routes
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
    });
});
