// Unit test for src/app/error-404/page.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Error404Page from './page';

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Error404Page', () => {
  it('renders 404 and Vietnamese texts', () => {
    render(<Error404Page />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy trang')).toBeInTheDocument();
    expect(
      screen.getByText(/Trang bạn đang tìm kiếm không tồn tại/)
    ).toBeInTheDocument();
    expect(screen.getByText('Quay về trang chủ')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Quay về trang chủ' })
    ).toHaveAttribute('href', '/');
  });
});
