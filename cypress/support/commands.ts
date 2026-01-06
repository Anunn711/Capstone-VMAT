/// <reference types="cypress" />

// Import code coverage support
import '@cypress/code-coverage/support';

// Custom commands
declare global {
    namespace Cypress {
        interface Chainable {
            login(username: string, password: string): Chainable<void>;
            logout(): Chainable<void>;
            createTestUser(username: string, password: string, email?: string): Chainable<void>;
            uploadCsvFile(fileName: string): Chainable<void>;
            navigateToPage(page: string): Chainable<void>;
            waitForApiResponse(alias: string, timeout?: number): Chainable<void>;
        }
    }
}

/**
 * Custom command to login
 */
Cypress.Commands.add('login', (username: string, password: string) => {
    cy.visit('/login');
    // Use placeholder text to find inputs since they don't have name attributes
    cy.get('input[placeholder="Enter your username"]').type(username);
    cy.get('input[placeholder="Enter your password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
});

/**
 * Custom command to logout
 */
Cypress.Commands.add('logout', () => {
    cy.contains('button', 'Logout').click();
    cy.url().should('include', '/login');
});

/**
 * Custom command to create a test user
 */
Cypress.Commands.add('createTestUser', (username: string, password: string, email?: string) => {
    cy.visit('/register');
    cy.get('input[placeholder*="username"]').type(username);
    cy.get('input[placeholder*="password"]').type(password);
    if (email) {
        cy.get('input[type="email"]').type(email);
    }
    cy.get('button[type="submit"]').click();
});

/**
 * Custom command to upload a CSV file
 */
Cypress.Commands.add('uploadCsvFile', (fileName: string) => {
    cy.fixture(fileName).then((fileContent) => {
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from(fileContent),
            fileName: fileName,
            mimeType: 'text/csv',
        }, { force: true });
    });
    cy.get('[data-cy="upload-button"]').click();
});

/**
 * Custom command to navigate to a page using the sidebar
 */
Cypress.Commands.add('navigateToPage', (page: string) => {
    const pageNames: Record<string, string> = {
        'dashboard': 'Dashboard',
        'awaiting-review': 'Awaiting Review',
        'vulnerabilities': 'Vulnerability Catalog',
        'mitigations': 'Mitigations',
        'system-logs': 'System Logging'
    };
    cy.contains('a.nav-link, button', pageNames[page] || page).click();
});

/**
 * Custom command to wait for API response
 */
Cypress.Commands.add('waitForApiResponse', (alias: string, timeout: number = 10000) => {
    cy.wait(alias, { timeout });
});

export { };
