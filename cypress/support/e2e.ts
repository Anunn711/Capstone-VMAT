// Import commands
import './commands';

// Setup code coverage
import '@cypress/code-coverage/support';

// Hide fetch/XHR logs to reduce noise in test output
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
    // Return false to prevent Cypress from failing the test
    // You can add specific error handling here
    console.error('Uncaught exception:', err);
    return false;
});
