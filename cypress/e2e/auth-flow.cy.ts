/**
 * Authentication Flow Tests
 * 
 * Tests user registration, login, logout, and session management
 */

describe('Authentication Flow', () => {
    it('should display login page elements', () => {
        cy.visit('/login');
        cy.contains('Login').should('be.visible');
        cy.get('input[placeholder="Enter your username"]').should('be.visible');
        cy.get('input[placeholder="Enter your password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('should successfully login with valid credentials', () => {
        cy.visit('/login');
        cy.get('input[placeholder="Enter your username"]').type('admin');
        cy.get('input[placeholder="Enter your password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
    });

    it('should show error with invalid credentials', () => {
        cy.visit('/login');
        cy.get('input[placeholder="Enter your username"]').type('wronguser');
        cy.get('input[placeholder="Enter your password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains(/invalid|error/i);
    });

    it('should maintain session across page refreshes', () => {
        cy.login('admin', 'password');
        cy.visit('/dashboard');
        cy.reload();
        cy.url().should('include', '/dashboard');
        cy.contains('Dashboard');
    });

    it('should successfully logout and redirect to login', () => {
        cy.login('admin', 'password');
        cy.visit('/dashboard');
        cy.contains('button', 'Logout').click();
        cy.url().should('include', '/login');
        cy.contains('Login');
    });
});
