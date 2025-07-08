// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (
  app &&
  !app.document.head.querySelector('[data-hide-command-log-request]')
) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Cypress global configuration
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Returning false here prevents Cypress from failing the test due to uncaught exceptions
  // This is useful for handling expected errors or third-party library errors

  // Don't fail on Firebase auth errors during testing
  if (err.message.includes('Firebase') || err.message.includes('auth')) {
    return false;
  }

  // Don't fail on Next.js hydration errors during testing
  if (err.message.includes('hydration') || err.message.includes('Hydration')) {
    return false;
  }

  // Don't fail on network errors during testing
  if (err.message.includes('Network Error') || err.message.includes('fetch')) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Custom commands for better test readability
export {};

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test credentials
       * @example cy.login()
       */
      login(): Chainable<void>;

      /**
       * Custom command to login as admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;

      /**
       * Custom command to check if user is authenticated
       * @example cy.checkAuthentication()
       */
      checkAuthentication(): Chainable<void>;

      /**
       * Custom command to wait for page to load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>;

      /**
       * Custom command to mock Firebase auth
       * @example cy.mockFirebaseAuth()
       */
      mockFirebaseAuth(): Chainable<void>;
    }
  }
}
