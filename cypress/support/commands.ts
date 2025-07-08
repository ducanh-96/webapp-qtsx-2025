/// <reference types="cypress" />

// Custom commands for the enterprise web application

// Login command for regular users
Cypress.Commands.add('login', () => {
  cy.session('user-login', () => {
    cy.visit('/auth/login');
    cy.get('[data-testid="email-input"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('[data-testid="password-input"]').type(
      Cypress.env('TEST_USER_PASSWORD')
    );
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('not.include', '/auth/login');
    cy.waitForPageLoad();
  });
});

// Login command for admin users
Cypress.Commands.add('loginAsAdmin', () => {
  cy.session('admin-login', () => {
    cy.visit('/auth/login');
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('AdminPassword123!');
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('not.include', '/auth/login');
    cy.waitForPageLoad();
  });
});

// Check authentication status
Cypress.Commands.add('checkAuthentication', () => {
  cy.window().then(win => {
    // Check if user is authenticated by looking for auth token or user data
    const authData = win.localStorage.getItem('firebase:authUser');
    if (authData) {
      cy.log('User is authenticated');
    } else {
      cy.log('User is not authenticated');
    }
  });
});

// Wait for page to fully load
Cypress.Commands.add('waitForPageLoad', () => {
  // Wait for the page to be loaded and interactive
  cy.document().should('have.property', 'readyState', 'complete');

  // Wait for React to finish rendering
  cy.get('body').should('be.visible');

  // Wait for any loading spinners to disappear
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should(
    'not.exist'
  );

  // Wait for network requests to complete
  cy.wait(500);
});

// Mock Firebase authentication for testing
Cypress.Commands.add('mockFirebaseAuth', () => {
  cy.window().then(win => {
    // Mock Firebase auth user
    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: true,
      role: 'user',
      department: 'Engineering',
    };

    // Store mock user in localStorage
    win.localStorage.setItem('firebase:authUser', JSON.stringify(mockUser));

    // Mock Firebase auth methods if available
    const winWithFirebase = win as unknown as {
      firebase?: {
        auth: () => {
          currentUser: unknown;
          onAuthStateChanged: (cb: unknown) => () => void;
        };
      };
    };
    if (winWithFirebase.firebase) {
      cy.stub(winWithFirebase.firebase.auth(), 'currentUser').value(mockUser);
      cy.stub(winWithFirebase.firebase.auth(), 'onAuthStateChanged').callsFake(
        (callback: unknown) => {
          if (typeof callback === 'function') {
            (callback as (user: unknown) => void)(mockUser);
          }
          return () => {}; // Unsubscribe function
        }
      );
    }
  });
});

// Additional utility commands for testing

// Wait for element to be visible and stable
Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible').and('not.be.disabled');
});

// Clear all application data
Cypress.Commands.add('clearAppData', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then(win => {
    win.sessionStorage.clear();
    // Clear IndexedDB if used by the app
    if (win.indexedDB) {
      // Note: This is a simplified version - in practice, you'd need to
      // iterate through all databases and clear them
    }
  });
});

// Navigate and wait for page load
Cypress.Commands.add('navigateAndWait', (path: string) => {
  cy.visit(path);
  cy.waitForPageLoad();
});

// Type in input with better error handling
Cypress.Commands.add('typeInInput', (selector: string, text: string) => {
  cy.get(selector).should('be.visible').clear().type(text);
});

// Click element with retry logic
Cypress.Commands.add('clickElement', (selector: string) => {
  cy.get(selector).should('be.visible').and('not.be.disabled').click();
});

// Check for error messages
Cypress.Commands.add('checkForErrors', () => {
  // Check for common error selectors
  cy.get('[data-testid="error-message"]').should('not.exist');
  cy.get('.error').should('not.exist');
  cy.get('[role="alert"]').should('not.exist');
});

// Wait for API requests to complete
Cypress.Commands.add('waitForApiRequests', () => {
  // Wait for any pending network requests
  cy.intercept('**').as('apiRequest');
  cy.wait('@apiRequest', { timeout: 10000 }).then(() => {
    cy.wait(500); // Additional buffer time
  });
});

// Extend Cypress namespace for TypeScript support
export {};

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      checkAuthentication(): Chainable<void>;
      waitForPageLoad(): Chainable<void>;
      mockFirebaseAuth(): Chainable<void>;
      waitForElement(selector: string, timeout?: number): Chainable<void>;
      clearAppData(): Chainable<void>;
      navigateAndWait(path: string): Chainable<void>;
      typeInInput(selector: string, text: string): Chainable<void>;
      clickElement(selector: string): Chainable<void>;
      checkForErrors(): Chainable<void>;
      waitForApiRequests(): Chainable<void>;
    }
  }
}

// Export for module compatibility
export {};
