// Unit test for src/app/auth/signup/page.tsx (SignUpPage)
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SignUpPage from './page';

// Mock useAuth
const signUpWithEmailMock = jest.fn();
let errorValue = '';
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signUpWithEmail: signUpWithEmailMock,
    error: errorValue,
  }),
}));

// Mock useRouter
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    signUpWithEmailMock.mockClear();
    pushMock.mockClear();
  });

  it('renders form and UI tiếng Việt', () => {
    render(<SignUpPage />);
    expect(screen.getByText('Đăng ký tài khoản')).toBeInTheDocument();
    expect(
      screen.getByText('Tạo tài khoản mới để sử dụng hệ thống')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Địa chỉ Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên hiển thị')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByText('Đăng ký')).toBeInTheDocument();
    expect(screen.getByText('Đã có tài khoản?')).toBeInTheDocument();
  });

  it('shows validation errors', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.input(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: '' },
      });
      fireEvent.blur(screen.getByPlaceholderText('Nhập email của bạn'));
      fireEvent.input(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: '' },
      });
      fireEvent.blur(screen.getByPlaceholderText('Nhập tên hiển thị'));
      fireEvent.input(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '' },
      });
      fireEvent.blur(screen.getByPlaceholderText('Nhập mật khẩu'));
    });
    expect(await screen.findByTestId('email-error')).toHaveTextContent(
      'Email là bắt buộc'
    );
    expect(await screen.findByTestId('displayName-error')).toHaveTextContent(
      'Tên hiển thị là bắt buộc'
    );
    expect(await screen.findByTestId('password-error')).toHaveTextContent(
      'Mật khẩu là bắt buộc'
    );
  });

  it('shows invalid email and short password errors', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.input(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: 'abc' },
      });
      fireEvent.input(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: 'Test' },
      });
      fireEvent.input(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '123' },
      });
    });
    fireEvent.click(screen.getByText('Đăng ký'));
    expect(await screen.findByTestId('email-error')).toHaveTextContent(
      'Email không hợp lệ'
    );
    expect(await screen.findByTestId('password-error')).toHaveTextContent(
      'Mật khẩu tối thiểu 6 ký tự'
    );
  });

  it('calls signUpWithEmail and redirects on success', async () => {
    signUpWithEmailMock.mockResolvedValueOnce(undefined);
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByText('Đăng ký'));
    // Wait for async actions
    await screen.findByTestId('submit-count');
    expect(signUpWithEmailMock).toHaveBeenCalledWith(
      'test@example.com',
      '123456',
      'Test'
    );
    expect(pushMock).toHaveBeenCalledWith('/auth/login');
  });

  it('shows error from context', () => {
    errorValue = 'Lỗi đăng ký';
    render(<SignUpPage />);
    expect(screen.getByText('Lỗi đăng ký')).toBeInTheDocument();
    errorValue = '';
  });
});
