// Unit test for src/app/admin/page.tsx (AdminPage)
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPage from '../admin/page';

// Mock ProtectedRoute to just render children
jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock UserManagement
jest.mock('@/components/admin/UserManagement', () => {
  const MockUserManagement = () => (
    <div data-testid="user-management">UserManagement</div>
  );
  MockUserManagement.displayName = 'MockUserManagement';
  return MockUserManagement;
});

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: jest.fn() }),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    // Mock fetch for health data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: 'healthy',
            uptime: 1234,
            version: '1.0.0',
            environment: 'test',
            checks: {
              database: { status: 'healthy', responseTime: 10 },
              powerbi: { status: 'healthy', responseTime: 20 },
              cache: { status: 'healthy', responseTime: 5 },
              security: { status: 'healthy', responseTime: 8 },
            },
            performance: {
              memoryUsage: { rss: 123456 },
              responseTime: 50,
            },
            security: {
              recentAlerts: 0,
              activeSessions: 1,
            },
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders dashboard cards and tabs', async () => {
    render(<AdminPage />);
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('API Status')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Healthy')).toBeInTheDocument()
    );
    // expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('switches tab to System Settings', async () => {
    render(<AdminPage />);
    const tab = screen.getByText('Cài đặt hệ thống');
    fireEvent.click(tab);
    expect(
      await screen.findByText('System settings management UI coming soon.')
    ).toBeInTheDocument();
  });

  it('opens and closes modal on card click', async () => {
    render(<AdminPage />);
    const card = screen.getByText('System Health');
    fireEvent.click(card);
    await waitFor(() =>
      expect(screen.getByText('System Health Details')).toBeInTheDocument()
    );
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('System Health Details')).not.toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject('API error')
    );
    render(<AdminPage />);
    await waitFor(() =>
      expect(screen.getByText('System Health')).toBeInTheDocument()
    );
    // Should show "Unknown" status if fetch fails (có nhiều card cùng text)
    await waitFor(() =>
      expect(screen.getAllByText('Unknown').length).toBeGreaterThanOrEqual(1)
    );
  });
});
