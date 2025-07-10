// Unit test for src/app/profile/page.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './page';

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
    const input = screen.getByPlaceholderText('Nhập tên hiển thị');
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
    await waitFor(() =>
      expect(screen.getByText('Cập nhật thất bại')).toBeInTheDocument()
    );
  });

  it('shows password form and validation', () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    expect(screen.getByText('Mật khẩu cũ')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument();
    expect(screen.getByText('Xác nhận mật khẩu mới')).toBeInTheDocument();
    expect(screen.getByText('Lưu mật khẩu')).toBeInTheDocument();
  });
});
