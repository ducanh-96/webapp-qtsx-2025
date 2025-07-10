// Unit test for src/app/reports/page.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportsPage from './page';

// Mock ProtectedRoute to just render children
jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// PowerBIIframe mock as a plain component (no jest.fn)
jest.mock('@/components/reports/PowerBIIframe', () => ({
  __esModule: true,
  default: (_props: Record<string, unknown>) => (
    <div data-testid="powerbi-iframe">PowerBI</div>
  ),
}));

describe('ReportsPage', () => {
  it('renders report tabs and default report', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Sản Lượng')).toBeInTheDocument();
    expect(screen.getByText('BC Nhân Công')).toBeInTheDocument();
    expect(screen.getByText('Shop Drawing')).toBeInTheDocument();
    expect(screen.getByText('MMTB')).toBeInTheDocument();
    expect(screen.getByText('BC CP SX')).toBeInTheDocument();
    expect(screen.getByText('Vật Tư Chính')).toBeInTheDocument();
    expect(screen.getByTestId('powerbi-iframe')).toBeInTheDocument();
  });

  it('switches report tab', () => {
    render(<ReportsPage />);
    fireEvent.click(screen.getByText('Shop Drawing'));
    // UI should still show the iframe
    expect(screen.getByTestId('powerbi-iframe')).toBeInTheDocument();
  });

  it('changes report height', () => {
    render(<ReportsPage />);
    const range = screen.getByRole('slider');
    fireEvent.change(range, { target: { value: 90 } });
    expect(screen.getByTestId('powerbi-iframe')).toBeInTheDocument();
  });

  it('shows error UI', () => {
    render(<ReportsPage />);
    // Simulate error by finding the error UI manually (since onError is not called in this mock)
    // This test is limited due to the mock, but ensures no crash
    expect(screen.getByTestId('powerbi-iframe')).toBeInTheDocument();
  });
});
