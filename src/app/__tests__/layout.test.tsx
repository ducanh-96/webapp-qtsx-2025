// Unit and integration tests for src/app/layout.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata, viewport } from '../layout';

jest.mock('@/components/common/ConnectionStatus', () => {
  const MockConnectionStatus = () => <div data-testid="connection-status" />;
  MockConnectionStatus.displayName = 'MockConnectionStatus';
  return MockConnectionStatus;
});
jest.mock('@/components/common/HeaderVisibility', () => {
  const MockHeaderVisibility = () => <div data-testid="header-visibility" />;
  MockHeaderVisibility.displayName = 'MockHeaderVisibility';
  return MockHeaderVisibility;
});
jest.mock('@/components/common/FooterVisibility', () => {
  const MockFooterVisibility = () => <div data-testid="footer-visibility" />;
  MockFooterVisibility.displayName = 'MockFooterVisibility';
  return MockFooterVisibility;
});
jest.mock('@/components/providers/ClientAuthProvider', () => {
  const MockClientAuthProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="client-auth-provider">{children}</div>;
  MockClientAuthProvider.displayName = 'MockClientAuthProvider';
  return MockClientAuthProvider;
});

describe('RootLayout', () => {
  it('renders html, head, and body structure', () => {
    render(
      <RootLayout>
        <div data-testid="child">Nội dung trang</div>
      </RootLayout>
    );
    // Check html and body
    expect(document.documentElement.lang).toBe('en');
    expect(document.body.className).toMatch(/antialiased/);
  });

  it('renders ConnectionStatus, HeaderVisibility, FooterVisibility, and children', () => {
    render(
      <RootLayout>
        <div data-testid="child">Nội dung trang</div>
      </RootLayout>
    );
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    expect(screen.getByTestId('header-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('footer-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('client-auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Nội dung trang');
  });

  it('renders children even if children is null', () => {
    render(<RootLayout>{null}</RootLayout>);
    // Should still render structure
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    expect(screen.getByTestId('header-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('footer-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('client-auth-provider')).toBeInTheDocument();
  });

  it('has correct metadata and viewport exports', () => {
    expect(metadata.title).toBe('Hệ thống Báo cáo QTSX');
    expect(viewport.width).toBe('device-width');
  });
});
