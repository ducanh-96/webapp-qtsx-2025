// Unit test for src/app/auth/signup/page.tsx (SignUpPage)
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button, Input } from './components';
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

    await act(async () => {
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
    });

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
  // --- Additional coverage for Button and Input components ---

  describe('Button component', () => {
    it('renders with default props', () => {
      render(<Button>Default</Button>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
    it('renders with secondary, outline, ghost, sm, lg, disabled, loading', () => {
      render(
        <>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </>
      );
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
      expect(screen.getByText('Ghost')).toBeInTheDocument();
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
      expect(screen.getByText('Disabled')).toBeInTheDocument();
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });
  });

  describe('Input component', () => {
    it('renders with default props', () => {
      render(<Input id="test" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('renders with type, disabled, required, error', () => {
      render(
        <Input
          id="test2"
          type="password"
          value="abc"
          onChange={() => {}}
          disabled
          required
          error="Error!"
        />
      );
      expect(screen.getByDisplayValue('abc')).toBeInTheDocument();
      expect(screen.getByTestId('test2-error')).toHaveTextContent('Error!');
    });
  });

  // --- Test early return in handleSignUp (validation fails) ---
  it('does not call signUpWithEmail if validation fails (early return)', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText('Đăng ký'));
    });
    expect(signUpWithEmailMock).not.toHaveBeenCalled();
  });

  // --- Test each validation branch in validateForm ---
  it('shows only invalid email error', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: 'invalid' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Đăng ký'));
    });
    expect(await screen.findByTestId('email-error')).toHaveTextContent(
      'Email không hợp lệ'
    );
  });

  it('shows only displayName required error', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: '' },
      });
      fireEvent.blur(screen.getByPlaceholderText('Nhập tên hiển thị'));
      fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Đăng ký'));
    });
    expect(await screen.findByTestId('displayName-error')).toHaveTextContent(
      'Tên hiển thị là bắt buộc'
    );
  });

  it('shows only password required error', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '' },
      });
      fireEvent.blur(screen.getByPlaceholderText('Nhập mật khẩu'));
      fireEvent.click(screen.getByText('Đăng ký'));
    });
    expect(await screen.findByTestId('password-error')).toHaveTextContent(
      'Mật khẩu là bắt buộc'
    );
  });

  it('shows only password too short error', async () => {
    render(<SignUpPage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
        target: { value: '123' },
      });
      fireEvent.click(screen.getByText('Đăng ký'));
    });
    expect(await screen.findByTestId('password-error')).toHaveTextContent(
      'Mật khẩu tối thiểu 6 ký tự'
    );
  });
});

// Test all validation branches in validateForm for full coverage
it('shows all validation errors at once (all fields invalid)', async () => {
  render(<SignUpPage />);
  await act(async () => {
    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
      target: { value: '' },
    });
    fireEvent.blur(screen.getByPlaceholderText('Nhập email của bạn'));
    fireEvent.change(screen.getByPlaceholderText('Nhập tên hiển thị'), {
      target: { value: '' },
    });
    fireEvent.blur(screen.getByPlaceholderText('Nhập tên hiển thị'));
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
      target: { value: '' },
    });
    fireEvent.blur(screen.getByPlaceholderText('Nhập mật khẩu'));
    fireEvent.click(screen.getByText('Đăng ký'));
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
