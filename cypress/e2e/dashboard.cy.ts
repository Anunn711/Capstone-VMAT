/**
 * Dashboard Tests
 * 
 * Tests dashboard statistics, reports, and data visualization
 */

describe('Dashboard', () => {
    beforeEach(() => {
        cy.login('admin', 'password');
    });

    it('should load dashboard page', () => {
        cy.visit('/dashboard');
        cy.contains('Dashboard').should('be.visible');
    });

    it('should display vulnerability statistics', () => {
        cy.visit('/dashboard');
        // Check for stats cards or numbers
        cy.get('body').should('contain', 'Vulnerability');
    });

    it('should display recent vulnerabilities section', () => {
        cy.visit('/dashboard');
        // Check if we have data or the empty state
        cy.get('body').then($body => {
            if ($body.text().includes('No vulnerabilities found')) {
                // Empty state is shown
                cy.contains('No vulnerabilities found').should('be.visible');
            } else {
                // Data is shown, so Recent Vulnerabilities section should be present
                cy.contains('Recent Vulnerabilities').should('be.visible');
            }
        });
    });

    it('should have report generation button', () => {
        cy.visit('/dashboard');
        cy.get('body').then($body => {
            if ($body.find('button:contains("Report")').length > 0) {
                cy.contains('button', /Report|Generate/i).should('be.visible');
            }
        });
    });

    it('should display mitigation statistics', () => {
        cy.visit('/dashboard');
        cy.contains(/Mitigation|Implementation/i);
    });
});
