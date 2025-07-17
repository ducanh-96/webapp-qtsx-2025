// Unit test for AppHeader

import { render, screen, fireEvent } from '@testing-library/react';
import AppHeader from '../AppHeader';

// Mock next/image to render img
import React from 'react';
import { UserAvatar, DefaultUserSVG } from '../AppHeader';
import * as AuthContextModule from '@/contexts/AuthContext';
import { waitFor } from '@testing-library/react';
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
jest.mock('@/contexts/AuthContext', () => {
  return {
    useAuth: jest.fn(),
  };
});

// Mock usePathname
import { usePathname } from 'next/navigation';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    // Default pathname is "/"
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/');
    // Default AuthContext mock
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      user: {
        displayName: 'Nguyễn Văn A',
        email: 'a@example.com',
        photoURL: '',
        role: 'admin',
      },
      signOut: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
  // Cover: handleSignOut error branch (console.error)
  it('logs error if signOut throws in handleSignOut', async () => {
    const error = new Error('Sign out failed');
    const signOut = jest.fn().mockRejectedValue(error);
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Test', email: 'test@example.com', role: 'user' },
      signOut,
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Test/i });
    fireEvent.click(avatarBtn);
    fireEvent.click(screen.getByText(/Đăng xuất/i));
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Sign out error:', error);
    });
    (console.error as jest.Mock).mockRestore();
  });
  // Cover: DefaultUserSVG default width/height
  it('renders DefaultUserSVG with default width and height', () => {
    const { container } = render(<DefaultUserSVG />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });

  // Cover: UserAvatar default props (width, height, className)
  it('renders UserAvatar with default props', () => {
    const { container } = render(<UserAvatar alt="avatar" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });

  // Cover: UserAvatar with image error triggers fallback
  it('renders fallback avatar on image error', () => {
    const { container } = render(<UserAvatar src="broken.png" alt="avatar" />);
    // Simulate error
    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
      expect(container.querySelector('svg')).toBeInTheDocument();
    }
  });

  // Cover: fallback header text (unknown route)
  it('renders fallback header text for unknown route', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      .spyOn(require('next/navigation'), 'usePathname')
      .mockReturnValue('/unknown');
    render(<AppHeader />);
    expect(screen.getByText(/Báo cáo Quản trị Sản xuất/i)).toBeInTheDocument();
  });
  it('renders correct header text for /he-thong-ghi-nhan', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest
      .spyOn({ usePathname }, 'usePathname')
      .mockReturnValue('/he-thong-ghi-nhan');
    render(<AppHeader />);
    expect(screen.getByText(/Hệ thống ghi nhận/i)).toBeInTheDocument();
  });
  // Additional tests for 100% coverage

  it('does not render header text when hideHeaderText is true', () => {
    render(<AppHeader hideHeaderText />);
    expect(
      screen.queryByText(/Báo cáo Quản trị Sản xuất/i)
    ).not.toBeInTheDocument();
  });

  it('renders correct header text for /admin', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      .spyOn(require('next/navigation'), 'usePathname')
      .mockReturnValue('/admin');
    render(<AppHeader />);
    expect(screen.getByText(/Cửa sổ quản trị viên/i)).toBeInTheDocument();
  });

  it('renders correct header text for /profile', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      .spyOn(require('next/navigation'), 'usePathname')
      .mockReturnValue('/profile');
    render(<AppHeader />);
    expect(
      screen.getByText(/Chi tiết thông tin người dùng/i)
    ).toBeInTheDocument();
  });

  it('renders fallback avatar when no photoURL', () => {
    const { container } = render(<AppHeader />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback user info when no displayName or email', () => {
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      user: {},
      signOut: jest.fn(),
    });
    render(<AppHeader />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('shows admin link in dropdown for admin role', () => {
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    expect(screen.getByText(/Quản trị viên/i)).toBeInTheDocument();
  });

  it('does not show admin link in dropdown for non-admin role', () => {
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user', displayName: 'User', email: 'user@example.com' },
      signOut: jest.fn(),
    });
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /User/i });
    fireEvent.click(avatarBtn);
    expect(screen.queryByText(/Quản trị viên/i)).not.toBeInTheDocument();
  });

  it('calls signOut when Đăng xuất is clicked', () => {
    const signOut = jest.fn();
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Test', email: 'test@example.com', role: 'user' },
      signOut,
    });
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Test/i });
    fireEvent.click(avatarBtn);
    fireEvent.click(screen.getByText(/Đăng xuất/i));
    expect(signOut).toHaveBeenCalled();
  });

  it('navigates to profile when Thông tin tài khoản is clicked', () => {
    const locationDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'location'
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    fireEvent.click(screen.getByText(/Thông tin tài khoản/i));
    expect(window.location.href).toBe('/profile');
    if (locationDescriptor) {
      Object.defineProperty(window, 'location', locationDescriptor);
    }
  });
  // Cover: Dropdown link onClick handlers close menu (outside describe)
  it('closes dropdown when clicking Báo cáo Quản trị Sản xuất', () => {
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    const links = screen.getAllByText(/Báo cáo Quản trị Sản xuất/i);
    // The dropdown link is an <a> element
    const dropdownLink = links.find(el => el.tagName === 'A');
    expect(dropdownLink).toBeDefined();
    if (dropdownLink) {
      fireEvent.click(dropdownLink);
    }
    expect(screen.queryByText(/Đăng xuất/i)).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking Hệ thống Ghi nhận', () => {
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    fireEvent.click(screen.getByText(/Hệ thống Ghi nhận/i));
    expect(screen.queryByText(/Đăng xuất/i)).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking Hệ thống BC QTSC Dự Án', () => {
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    fireEvent.click(screen.getByText(/Hệ thống BC QTSC Dự Án/i));
    expect(screen.queryByText(/Đăng xuất/i)).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking Quản trị viên', () => {
    render(<AppHeader />);
    const avatarBtn = screen.getByRole('button', { name: /Nguyễn Văn A/i });
    fireEvent.click(avatarBtn);
    fireEvent.click(screen.getByText(/Quản trị viên/i));
    expect(screen.queryByText(/Đăng xuất/i)).not.toBeInTheDocument();
  });
});
