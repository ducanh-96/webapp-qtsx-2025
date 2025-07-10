// Unit test for AppFooter

import { render, screen } from '@testing-library/react';
import AppFooter from '../AppFooter';

describe('AppFooter', () => {
  it('renders company name, address, phone, and copyright', () => {
    render(<AppFooter />);
    expect(
      screen.getByText(/CÔNG TY CỔ PHẦN CƠ KHÍ XÂY DỰNG THƯƠNG MẠI ĐẠI DŨNG/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/123 Bạch Đằng/i)).toBeInTheDocument();
    expect(screen.getByText(/\+84 28 38681689/i)).toBeInTheDocument();
    expect(screen.getByText(/Powered by Ban KSNB/i)).toBeInTheDocument();
  });

  it('renders website link with correct href', () => {
    render(<AppFooter />);
    const link = screen.getByRole('link', { name: /www.daidung.com/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.daidung.com');
  });
});
