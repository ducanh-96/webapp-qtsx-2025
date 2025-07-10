// Unit test for AppHeader

import { render, screen, fireEvent } from '@testing-library/react';
import AppHeader from '../AppHeader';

// Mock next/image to render img
import React from 'react';
jest.mock('next/image', () => {
  type MockImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    alt?: string;
  };
  function MockImage({ alt = 'Mock image', ...props }: MockImageProps) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mock next/link to render anchor
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Nguyễn Văn A',
      email: 'a@example.com',
      photoURL: '',
      role: 'admin',
    },
    signOut: jest.fn(),
  }),
}));

// Mock usePathname
import { usePathname } from 'next/navigation';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    // Default pathname is "/"
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/');
  });

  it('renders logo, header text, and user info', () => {
    render(<AppHeader />);
    expect(screen.getByAltText(/Company Logo/i)).toBeInTheDocument();
    expect(screen.getByText(/Báo cáo Quản trị Sản xuất/i)).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('shows dropdown menu when avatar clicked', () => {
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    expect(screen.getByText(/Thông tin tài khoản/i)).toBeInTheDocument();
    expect(screen.getByText(/Đăng xuất/i)).toBeInTheDocument();
    expect(screen.getByText(/Quản trị viên/i)).toBeInTheDocument();
  });

  it('renders correct header text for /he-thong-ghi-nhan', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest
      .spyOn({ usePathname }, 'usePathname')
      .mockReturnValue('/he-thong-ghi-nhan');
    render(<AppHeader />);
    expect(screen.getByText(/Hệ thống ghi nhận/i)).toBeInTheDocument();
  });
});
