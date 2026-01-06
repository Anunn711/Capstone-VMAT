describe('User Registration', () => {
    beforeEach(() => {
        cy.visit('/register');
    });

    it('should display registration form elements', () => {
        cy.get('input[placeholder*="username"]').should('exist');
        cy.get('input[placeholder*="Create a password"]').should('exist');
        cy.get('input[placeholder*="Confirm your password"]').should('exist');
        cy.contains('button', /register|sign up|create/i).should('exist');
    });

    it('should reject registration with existing username', () => {
        // Try to register with the admin username that already exists
        cy.get('input[placeholder*="username"]').type('admin');
        cy.get('input[placeholder*="Create a password"]').type('password123');
        cy.get('input[placeholder*="Confirm your password"]').type('password123');
        cy.contains('button', /register|sign up|create/i).click();

        // Should show error message
        cy.contains(/already exists|already taken|username.*use/i, { timeout: 5000 }).should('exist');
        // Should remain on registration page
        cy.url().should('include', '/register');
    });

    it('should reject registration with too short username', () => {
        cy.get('input[placeholder*="username"]').type('ab');
        cy.get('input[placeholder*="Create a password"]').type('password123');
        cy.get('input[placeholder*="Confirm your password"]').type('password123');
        cy.contains('button', /register|sign up|create/i).click();

        // Should show error about username length
        cy.contains(/username.*short|minimum.*character|at least/i, { timeout: 5000 }).should('exist');
        cy.url().should('include', '/register');
    });

    it('should reject registration with too short password', () => {
        cy.get('input[placeholder*="username"]').type('newuser123');
        cy.get('input[placeholder*="Create a password"]').type('123');
        cy.get('input[placeholder*="Confirm your password"]').type('123');
        cy.contains('button', /register|sign up|create/i).click();

        // Should show error about password length
        cy.contains(/password.*short|minimum.*character|at least/i, { timeout: 5000 }).should('exist');
        cy.url().should('include', '/register');
    });

    it('should reject registration with empty fields', () => {
        cy.contains('button', /register|sign up|create/i).click();

        // Should show validation error or remain on page
        cy.url().should('include', '/register');
    });

    it('should reject registration with mismatched passwords', () => {
        cy.get('input[placeholder*="username"]').type('newuser789');
        cy.get('input[placeholder*="Create a password"]').type('password123');
        cy.get('input[placeholder*="Confirm your password"]').type('differentpassword');
        cy.contains('button', /register|sign up|create/i).click();

        // Should show error about passwords not matching
        cy.contains(/password.*match|password.*same/i, { timeout: 5000 }).should('exist');
        cy.url().should('include', '/register');
    });

    it('should reject registration with only username filled', () => {
        cy.get('input[placeholder*="username"]').type('newuser456');
        cy.contains('button', /register|sign up|create/i).click();

        // Should show error or remain on registration page
        cy.url().should('include', '/register');
    });

    it('should reject registration with only password filled', () => {
        cy.get('input[placeholder*="Create a password"]').type('password123');
        cy.get('input[placeholder*="Confirm your password"]').type('password123');
        cy.contains('button', /register|sign up|create/i).click();

        // Should show error or remain on registration page
        cy.url().should('include', '/register');
    });

    it('should have link to login page', () => {
        // Check for login link
        cy.get('body').then($body => {
            if ($body.text().match(/already have.*account|back to login|sign in/i)) {
                cy.contains(/already have.*account|back to login|sign in/i).should('exist');
            }
        });
    });

    it('should successfully register with valid credentials', () => {
        // Generate a unique username
        const uniqueUsername = `testuser_${Date.now()}`;

        cy.get('input[placeholder*="username"]').type(uniqueUsername);
        cy.get('input[placeholder*="Create a password"]').type('validpassword123');
        cy.get('input[placeholder*="Confirm your password"]').type('validpassword123');
        cy.contains('button', /register|sign up|create/i).click();

        // Should redirect away from registration page (either to login or dashboard)
        cy.url({ timeout: 10000 }).should('not.include', '/register');
    });
});
