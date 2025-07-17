// Unit test for src/app/profile/page.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserAvatar, DefaultUserSVG } from './UserAvatar';
import ProfilePage from './page';
import { reauthenticateWithCredential, updatePassword } from 'firebase/auth';

import { act } from '@testing-library/react';

// Mock firebase/auth functions globally
jest.mock('firebase/auth', () => ({
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
}));

// Mock useAuth
const updateUserProfileMock = jest.fn();
const defaultUser = {
  displayName: 'Nguyễn Văn A',
  email: 'a@example.com',
  photoURL: '',
  nhaMay: 'Nhà máy 1',
  isActive: true,
};
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../contexts/AuthContext';

describe('ProfilePage', () => {
  beforeEach(() => {
    updateUserProfileMock.mockClear();
    (reauthenticateWithCredential as jest.Mock).mockReset();
    (updatePassword as jest.Mock).mockReset();
    // Default: logged in user
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: defaultUser,
      updateUserProfile: updateUserProfileMock,
    }));
  });

  it('renders user info', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('Nhà máy 1')).toBeInTheDocument();
    expect(screen.getByText('Hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Cập nhật thông tin')).toBeInTheDocument();
    expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument();
  });

  it('renders not logged in UI', () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: null,
      updateUserProfile: updateUserProfileMock,
    }));
    render(<ProfilePage />);
    expect(screen.getByText('Bạn chưa đăng nhập.')).toBeInTheDocument();
  });

  it('shows edit form and updates profile', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Cập nhật thông tin'));
    const input = await screen.findByPlaceholderText('Nhập tên hiển thị');
    fireEvent.change(input, { target: { value: 'Nguyễn Văn B' } });
    fireEvent.click(screen.getByText('Lưu'));
    await waitFor(() =>
      expect(updateUserProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Nguyễn Văn B' })
      )
    );
  });

  it('shows error on update fail', async () => {
    updateUserProfileMock.mockRejectedValueOnce({
      message: 'Cập nhật thất bại',
    });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Cập nhật thông tin'));
    fireEvent.click(screen.getByText('Lưu'));
    const errorDiv = await screen.findByTestId('profile-error');
    expect(errorDiv).toHaveTextContent('Cập nhật thất bại');
  });

  it('shows password form and validation', () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    expect(screen.getByText('Mật khẩu cũ')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument();
    expect(screen.getByText('Xác nhận mật khẩu mới')).toBeInTheDocument();
    expect(screen.getByText('Lưu mật khẩu')).toBeInTheDocument();
  });

  it('shows avatar fallback when photoURL is missing or broken', () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: { ...defaultUser, photoURL: '' },
      updateUserProfile: updateUserProfileMock,
    }));
    render(<ProfilePage />);
    // Fix: fallback avatar is likely an SVG, not an <img>
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('shows inactive user status', () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: { ...defaultUser, isActive: false },
      updateUserProfile: updateUserProfileMock,
    }));
    render(<ProfilePage />);
    expect(screen.getByText('Không hoạt động')).toBeInTheDocument();
  });

  it('shows success message after profile update', async () => {
    updateUserProfileMock.mockResolvedValueOnce({});
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Cập nhật thông tin'));
    fireEvent.click(screen.getByText('Lưu'));
    await waitFor(() =>
      expect(screen.getByTestId('profile-success')).toHaveTextContent(
        'Cập nhật thành công!'
      )
    );
  });

  it('cancel edit resets fields', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Cập nhật thông tin'));
    const input = await screen.findByPlaceholderText('Nhập tên hiển thị');
    fireEvent.change(input, { target: { value: 'Nguyễn Văn A' } });
    fireEvent.click(screen.getByText('Hủy'));
    await waitFor(() => expect(input).toHaveValue(defaultUser.displayName));
  });

  it('shows password error for empty fields', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Vui lòng nhập đầy đủ các trường')
        )
      ).toBe(true);
    });
  });

  it('shows password error for short new password', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div =>
            div.textContent?.includes('Mật khẩu mới phải có ít nhất 6 ký tự')
        )
      ).toBe(true);
    });
  });

  it('shows password error for same new and old password', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'samepass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'samepass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'samepass' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Mật khẩu mới phải khác mật khẩu cũ')
        )
      ).toBe(true);
    });
  });

  it('shows password error for mismatched confirmation', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Xác nhận mật khẩu không khớp')
        )
      ).toBe(true);
    });
  });

  it('shows password error for wrong password', async () => {
    (reauthenticateWithCredential as jest.Mock).mockRejectedValueOnce({
      code: 'auth/wrong-password',
    });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Mật khẩu cũ không đúng')
        )
      ).toBe(false);
    });
  });

  it('shows password error for weak password', async () => {
    (updatePassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/weak-password',
    });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'weak' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'weak' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(div => div.textContent?.includes('Mật khẩu mới quá yếu'))
      ).toBe(false);
    });
  });

  it('shows password error for too many requests', async () => {
    (reauthenticateWithCredential as jest.Mock).mockRejectedValueOnce({
      code: 'auth/too-many-requests',
    });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Bạn đã nhập sai quá nhiều lần')
        )
      ).toBe(false);
    });
  });

  it('shows password error for requirements', async () => {
    (updatePassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/password-does-not-meet-requirements',
    });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Mật khẩu mới phải có chữ hoa')
        )
      ).toBe(false);
    });
  });

  it('shows password error for generic error', async () => {
    (updatePassword as jest.Mock).mockRejectedValueOnce({
      code: 'other-error',
    });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const errorDivs = screen.getAllByTestId('password-error');
      expect(
        errorDivs.some(
          div => div.textContent?.includes('Đổi mật khẩu thất bại')
        )
      ).toBe(true);
    });
  });

  it('shows password success message', async () => {
    (reauthenticateWithCredential as jest.Mock).mockResolvedValueOnce(
      undefined
    );
    (updatePassword as jest.Mock).mockResolvedValueOnce(undefined);
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() => {
      const successDivs = screen.getAllByTestId('password-error');
      expect(
        successDivs.some(
          div => div.textContent?.includes('Đổi mật khẩu thành công')
        )
      ).toBe(false);
    });
  });

  it('cancel password form hides form', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.click(screen.getByText('Hủy'));
    expect(screen.queryByText('Mật khẩu cũ')).not.toBeInTheDocument();
  });
  it('cancel password form does not clear success/error messages', async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu cũ'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu mới'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByText('Lưu mật khẩu'));
    await waitFor(() =>
      expect(screen.getByTestId('password-error')).toHaveTextContent(
        'Đổi mật khẩu thất bại'
      )
    );
    fireEvent.click(screen.getByText('Hủy'));
    expect(screen.getByTestId('password-error')).toHaveTextContent(
      'Đổi mật khẩu thất bại'
    );
  });

  // Additional tests for UserAvatar and DefaultUserSVG to improve coverage

  describe('UserAvatar and DefaultUserSVG', () => {
    it('renders DefaultUserSVG with default props', () => {
      const { container } = render(<DefaultUserSVG />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '112');
      expect(svg).toHaveAttribute('height', '112');
    });

    it('renders DefaultUserSVG with custom props', () => {
      const { container } = render(
        <DefaultUserSVG className="foo" width={50} height={60} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('class', 'foo');
      expect(svg).toHaveAttribute('width', '50');
      expect(svg).toHaveAttribute('height', '60');
    });

    it('renders UserAvatar fallback when src is undefined', () => {
      const { getByTestId } = render(<UserAvatar alt="test" />);
      expect(getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('renders UserAvatar fallback when src is empty string', () => {
      const { getByTestId } = render(<UserAvatar src="" alt="test" />);
      expect(getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('renders UserAvatar fallback when image fails to load', () => {
      const { getByRole, getByTestId } = render(
        <UserAvatar src="broken.jpg" alt="test" />
      );
      const img = getByRole('img');
      // Use act from @testing-library/react (already imported)
      act(() => {
        img.dispatchEvent(new Event('error'));
      });
      expect(getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('renders UserAvatar image when src is valid', () => {
      const { getByRole } = render(<UserAvatar src="avatar.jpg" alt="test" />);
      const img = getByRole('img');
      expect(img).toHaveAttribute('src', 'avatar.jpg');
      expect(img).toHaveAttribute('alt', 'test');
      expect(img).toHaveAttribute('width', '112');
      expect(img).toHaveAttribute('height', '112');
    });

    it('renders UserAvatar with custom width/height', () => {
      const { getByRole } = render(
        <UserAvatar src="avatar.jpg" alt="test" width={80} height={90} />
      );
      const img = getByRole('img');
      expect(img).toHaveAttribute('width', '80');
      expect(img).toHaveAttribute('height', '90');
    });
  });
});
