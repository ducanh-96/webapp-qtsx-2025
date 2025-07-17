import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com', role: 'admin' },
    loading: false,
    error: null,
    isAuthenticated: true,
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    signOut: jest.fn(),
    updateUserProfile: jest.fn(),
    resendEmailVerification: jest.fn(),
    sendPasswordReset: jest.fn(),
  }),
}));
import UserManagement from '../UserManagement';
import { userService } from '@/config/firestore';

jest.mock('@/config/firestore', () => ({
  userService: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  },
}));

const mockGetUsers = userService.getUsers as jest.Mock;
const mockCreateUser = userService.createUser as jest.Mock;
const mockDeleteUser = userService.deleteUser as jest.Mock;

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component without crashing', async () => {
    mockGetUsers.mockResolvedValueOnce({ users: [] });
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('Quản lý người dùng')).toBeInTheDocument();
    });
  });

  it('loads and displays users', async () => {
    const mockUsers = [
      {
        id: '1',
        email: 'alice@example.com',
        displayName: 'Alice',
        role: 'user',
        isActive: true,
      },
      {
        id: '2',
        email: 'bob@example.com',
        displayName: 'Bob',
        role: 'admin',
        isActive: false,
      },
    ];
    mockGetUsers.mockResolvedValueOnce({ users: mockUsers });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('handles inviting a new user', async () => {
    mockCreateUser.mockResolvedValueOnce({});
    mockGetUsers.mockResolvedValueOnce({ users: [] });

    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('Quản lý người dùng')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Mời người dùng' }));
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('nguoidung@congty.com'), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), {
        target: { value: 'New User' },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }));
    });

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newuser@example.com',
          displayName: 'New User',
        })
      );
    });
  });

  it('handles deactivating a user', async () => {
    const mockUsers = [
      {
        id: '1',
        email: 'alice@example.com',
        displayName: 'Alice',
        role: 'user',
        isActive: true,
      },
    ];
    mockGetUsers.mockResolvedValueOnce({ users: mockUsers });
    mockDeleteUser.mockResolvedValueOnce({});

    // Mock window.confirm to always return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    });

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('1');
    });

    // Restore window.confirm
    (window.confirm as jest.Mock).mockRestore?.();
  });

  it('displays an error message when loading users fails', async () => {
    mockGetUsers.mockRejectedValueOnce(new Error('Failed to load users'));

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });
  // Cover: loadUsers error branch (Error instance, line 46)
  it('shows error if loadUsers throws Error (branch 46)', async () => {
    (userService.getUsers as jest.Mock).mockRejectedValue(
      new Error('fail load')
    );
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText(/fail load/i)).toBeInTheDocument();
    });
  });

  // Cover: deactivate confirm uses displayName or email (line 111)
  it('shows deactivate confirm with displayName fallback to email (branch 111)', async () => {
    window.confirm = jest.fn(() => false);
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [
        {
          id: '1',
          email: 'a@b.com',
          displayName: '',
          isActive: true,
          role: 'user',
        },
      ],
    });
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('a@b.com')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Deactivate/i));
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('a@b.com')
    );
  });

  // Cover: getRoleBadgeColor MANAGER (line 147) and default (line 151)
  it('getRoleBadgeColor returns badge-warning for MANAGER (branch 147)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRoleBadgeColor } = require('../UserManagement');
    expect(getRoleBadgeColor('manager')).toBe('badge-warning');
  });
  it('getRoleBadgeColor returns badge-secondary for unknown role (branch 151)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRoleBadgeColor } = require('../UserManagement');
    expect(getRoleBadgeColor('unknown')).toBe('badge-secondary');
  });

  // Cover: renders user photo if photoURL exists (line 373)
  it('renders user photo if photoURL exists (branch 373)', async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [
        {
          id: '1',
          email: 'a@b.com',
          displayName: 'A',
          isActive: true,
          role: 'user',
          photoURL: '/avatar.png',
        },
      ],
    });
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByAltText('A')).toBeInTheDocument();
    });
  });

  // Cover: user.displayName?.charAt(0) || user.email.charAt(0) (line 385)
  it('renders user initial fallback if no photoURL (branch 385)', async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [
        {
          id: '1',
          email: 'a@b.com',
          displayName: '',
          isActive: true,
          role: 'user',
        },
      ],
    });
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('a')).toBeInTheDocument();
    });
  });

  // Cover: user.displayName || "Không tên" (line 391)
  it('renders displayName fallback to "Không tên" (branch 391)', async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [
        {
          id: '1',
          email: 'a@b.com',
          displayName: '',
          isActive: true,
          role: 'user',
        },
      ],
    });
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('Không tên')).toBeInTheDocument();
    });
  });

  // Cover: "Quản lý" for manager role (line 408)
  // Fix: ensure users are loaded before checking for "Quản lý"
  it('renders "Quản lý" for manager role (branch 408)', async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [
        {
          id: '1',
          email: 'a@b.com',
          displayName: 'B',
          isActive: true,
          role: 'manager',
        },
      ],
    });
    render(<UserManagement />);
    await waitFor(() => {
      expect(
        screen.queryByText('Đang tải danh sách người dùng...')
      ).not.toBeInTheDocument();
    });
    // There are multiple "Quản lý" elements (label and badge), so check at least one exists
    expect(screen.getAllByText('Quản lý').length).toBeGreaterThan(0);
  });

  // Cover: loading ? "Đang mời..." : "Gửi lời mời" (line 544)
  // Cover: setLoading(true) in handleInviteUser (branch 59) and loading text (branch 544)
  it('sets loading true and disables submit button when inviting user (branch 59, 544)', async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [
        {
          id: '1',
          email: 'a@b.com',
          displayName: 'B',
          isActive: true,
          role: 'user',
        },
      ],
    });
    (userService.createUser as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    ); // never resolves
    render(<UserManagement />);
    await waitFor(() => {
      expect(
        screen.queryByText('Đang tải danh sách người dùng...')
      ).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Mời người dùng/i));
    fireEvent.change(screen.getByPlaceholderText('nguoidung@congty.com'), {
      target: { value: 'test@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), {
      target: { value: 'Test User' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }));
    });
    // Button should be disabled and show loading text
    const loadingBtn = screen.getByRole('button', { name: /Đang mời.../i });
    expect(loadingBtn).toBeDisabled();
  });
});
// Cover: <Image> alt fallback to "User" (branch 377)
it('renders user photo with alt fallback to "User" (branch 377)', async () => {
  (userService.getUsers as jest.Mock).mockResolvedValue({
    users: [
      {
        id: '1',
        email: 'a@b.com',
        displayName: '',
        isActive: true,
        role: 'user',
        photoURL: '/avatar.png',
      },
    ],
  });
  render(<UserManagement />);
  await waitFor(() => {
    expect(screen.getByAltText('User')).toBeInTheDocument();
  });
});
// Cover: handleInviteUser thành công (cover dòng 61)
it('invites user successfully and reloads users (cover line 61)', async () => {
  const mockGetUsers = userService.getUsers as jest.Mock;
  const mockCreateUser = userService.createUser as jest.Mock;
  mockGetUsers.mockResolvedValue({
    users: [
      {
        id: '1',
        email: 'a@b.com',
        displayName: 'B',
        isActive: true,
        role: 'user',
      },
    ],
  });
  mockCreateUser.mockResolvedValue({});
  render(<UserManagement />);
  await waitFor(() => {
    expect(
      screen.queryByText('Đang tải danh sách người dùng...')
    ).not.toBeInTheDocument();
  });
  fireEvent.click(screen.getByText(/Mời người dùng/i));
  fireEvent.change(screen.getByPlaceholderText('nguoidung@congty.com'), {
    target: { value: 'test@a.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), {
    target: { value: 'Test User' },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }));
  });
  // createUser phải được gọi
  expect(mockCreateUser).toHaveBeenCalledWith(
    expect.objectContaining({
      email: 'test@a.com',
      displayName: 'Test User',
    })
  );
  // loadUsers phải được gọi lại sau khi createUser thành công
  expect(mockGetUsers).toHaveBeenCalledTimes(2);
  // Modal should close (button disappears)
  await waitFor(() => {
    expect(
      screen.queryByRole('button', { name: 'Gửi lời mời' })
    ).not.toBeInTheDocument();
  });
});

// Cover: handleActivateUser thành công (cover 132-133)
it('activates user successfully (cover lines 132-133)', async () => {
  (userService.getUsers as jest.Mock).mockResolvedValue({
    users: [
      {
        id: '2',
        email: 'b@b.com',
        displayName: 'B',
        isActive: false,
        role: 'user',
      },
    ],
  });
  (userService.updateUser as jest.Mock).mockResolvedValue({});
  render(<UserManagement />);
  await waitFor(() => {
    expect(screen.getByText(/Activate/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText(/Activate/i));
  await waitFor(() => {
    expect(userService.updateUser).toHaveBeenCalledWith('2', {
      isActive: true,
    });
  });
});

// Cover: handleActivateUser thất bại (cover 135)
it('shows error if activate user fails (cover line 135)', async () => {
  (userService.getUsers as jest.Mock).mockResolvedValue({
    users: [
      {
        id: '2',
        email: 'b@b.com',
        displayName: 'B',
        isActive: false,
        role: 'user',
      },
    ],
  });
  (userService.updateUser as jest.Mock).mockRejectedValue(
    new Error('fail activate')
  );
  render(<UserManagement />);
  await waitFor(() => {
    expect(screen.getByText(/Activate/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText(/Activate/i));
  await waitFor(() => {
    expect(screen.getByText(/fail activate/i)).toBeInTheDocument();
  });
});

// Cover: getRoleBadgeColor các case (ADMIN, MANAGER, USER, default)
import { getRoleBadgeColor } from '../UserManagement';
import { UserRole } from '@/types';
// Cover: handleInviteUser lỗi (setLoading true, branch 59)
it('shows error if invite user fails (cover branch 59)', async () => {
  const mockGetUsers = userService.getUsers as jest.Mock;
  const mockCreateUser = userService.createUser as jest.Mock;
  mockGetUsers.mockResolvedValue({
    users: [
      {
        id: '1',
        email: 'a@b.com',
        displayName: 'B',
        isActive: true,
        role: 'user',
      },
    ],
  });
  mockCreateUser.mockRejectedValue(new Error('fail invite'));
  render(<UserManagement />);
  await waitFor(() => {
    expect(
      screen.queryByText('Đang tải danh sách người dùng...')
    ).not.toBeInTheDocument();
  });
  fireEvent.click(screen.getByText(/Mời người dùng/i));
  fireEvent.change(screen.getByPlaceholderText('nguoidung@congty.com'), {
    target: { value: 'test@a.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), {
    target: { value: 'Test User' },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }));
  });
  // Error message should show
  await waitFor(() => {
    expect(screen.getByText(/fail invite/i)).toBeInTheDocument();
  });
});

// Cover: getRoleBadgeColor returns badge-primary for USER (branch 149)
it('getRoleBadgeColor returns badge-primary for USER (branch 149)', () => {
  expect(getRoleBadgeColor(UserRole.USER)).toBe('badge-primary');
});
it('getRoleBadgeColor returns badge-error for ADMIN', () => {
  expect(getRoleBadgeColor(UserRole.ADMIN)).toBe('badge-error');
});
it('getRoleBadgeColor returns badge-warning for MANAGER', () => {
  expect(getRoleBadgeColor(UserRole.MANAGER)).toBe('badge-warning');
});
it('getRoleBadgeColor returns badge-primary for USER', () => {
  expect(getRoleBadgeColor(UserRole.USER)).toBe('badge-primary');
});
it('getRoleBadgeColor returns badge-secondary for unknown', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(getRoleBadgeColor('other' as any)).toBe('badge-secondary');
});
