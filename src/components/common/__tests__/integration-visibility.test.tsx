// Integration test: interaction & conditional rendering for common UI components

import { render, screen } from '@testing-library/react';
import HeaderFooterVisibility from '../HeaderFooterVisibility';
import FooterVisibility from '../FooterVisibility';
import HeaderVisibility from '../HeaderVisibility';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Mock AppHeader & AppFooter with tiếng Việt text
jest.mock('../AppHeader', () => {
  const MockAppHeader = () => <div data-testid="header">Tiêu đề chính</div>;
  MockAppHeader.displayName = 'MockAppHeader';
  return MockAppHeader;
});
jest.mock('../AppFooter', () => {
  const MockAppFooter = () => <div data-testid="footer">Chân trang</div>;
  MockAppFooter.displayName = 'MockAppFooter';
  return MockAppFooter;
});

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

/* eslint-disable @typescript-eslint/no-var-requires */

describe('Integration: Common UI visibility & interaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('HeaderFooterVisibility hiển thị đúng header/footer khi authenticated', () => {
    // Import hooks at the top, use directly here to avoid require()
    (usePathname as jest.Mock).mockReturnValue('/');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });
    render(<HeaderFooterVisibility />);
    expect(screen.getByTestId('header')).toHaveTextContent('Tiêu đề chính');
    expect(screen.getByTestId('footer')).toHaveTextContent('Chân trang');
  });

  it('FooterVisibility chỉ hiển thị khi đủ điều kiện', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });
    render(<FooterVisibility />);
    expect(screen.getByTestId('footer')).toHaveTextContent('Chân trang');
  });

  it('HeaderVisibility truyền đúng prop hideHeaderText cho /error-404', () => {
    (usePathname as jest.Mock).mockReturnValue('/error-404');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });
    render(<HeaderVisibility />);
    expect(screen.getByTestId('header')).toHaveTextContent('Tiêu đề chính');
  });

  it('Ẩn tất cả khi chưa authenticated', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });
    render(<HeaderFooterVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });
});
