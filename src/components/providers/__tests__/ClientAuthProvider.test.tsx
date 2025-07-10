// Unit test for ClientAuthProvider

import { render, screen } from '@testing-library/react';
import ClientAuthProvider from '../ClientAuthProvider';

// Mock next/dynamic to control loading and loaded state
jest.mock('next/dynamic', () => {
  const MockDynamic = () => {
    const DynamicComponent: React.FC<{ children: React.ReactNode }> = props => (
      <div data-testid="auth-provider">{props.children}</div>
    );
    DynamicComponent.displayName = 'MockDynamicComponent';
    return DynamicComponent;
  };
  MockDynamic.displayName = 'MockDynamic';
  return MockDynamic;
});

// Mock AuthProvider
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => {
    const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => <div data-testid="auth-provider">{children}</div>;
    MockAuthProvider.displayName = 'MockAuthProvider';
    return <MockAuthProvider>{children}</MockAuthProvider>;
  },
}));

describe('ClientAuthProvider', () => {
  it('renders children inside AuthProvider', () => {
    render(
      <ClientAuthProvider>
        <div>Test Child</div>
      </ClientAuthProvider>
    );
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  // Loading UI test is not meaningful here due to dynamic mock, but can be added if needed
});
