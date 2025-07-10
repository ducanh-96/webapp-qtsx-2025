// Unit test for src/app/dashboard/page.tsx
import React from 'react';
import { render } from '@testing-library/react';
import DashboardRedirect from './page';

// Mock useRouter
const replaceMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

describe('DashboardRedirect', () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it('redirects to /reports on mount', () => {
    render(<DashboardRedirect />);
    expect(replaceMock).toHaveBeenCalledWith('/reports');
  });

  it('does not throw if router is undefined', () => {
    jest.mock('next/navigation', () => ({
      useRouter: () => undefined,
    }));
    expect(() => render(<DashboardRedirect />)).not.toThrow();
  });
});
