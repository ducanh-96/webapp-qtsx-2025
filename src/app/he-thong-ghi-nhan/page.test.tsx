// Unit test for src/app/he-thong-ghi-nhan/page.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HeThongGhiNhanPage from './page';

describe('HeThongGhiNhanPage', () => {
  it('renders all main tree labels', () => {
    render(<HeThongGhiNhanPage />);
    expect(screen.getByText('HỒ SƠ THANH TOÁN')).toBeInTheDocument();
    expect(screen.getByText('HSE-5S')).toBeInTheDocument();
    expect(screen.getByText('SHOP DRAWING')).toBeInTheDocument();
    expect(screen.getByText('MMTB')).toBeInTheDocument();
    expect(screen.getByText('NĂNG SUẤT')).toBeInTheDocument();
    expect(screen.getByText('HỒ SƠ TRÌNH KÝ')).toBeInTheDocument();
  });

  it('renders all main tree labels count', () => {
    render(<HeThongGhiNhanPage />);
    // Đếm số lượng label lớn (treeList)
    const mainLabels = [
      'HỒ SƠ THANH TOÁN',
      'HSE-5S',
      'SHOP DRAWING',
      'MMTB',
      'NĂNG SUẤT',
      'HỒ SƠ TRÌNH KÝ',
    ];
    mainLabels.forEach(label => {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders a link with correct href', () => {
    render(<HeThongGhiNhanPage />);
    // Có nhiều "BAN TGĐ", lấy cái đầu tiên có thẻ <a>
    const allBanTGD = screen.getAllByText('BAN TGĐ');
    const link = allBanTGD
      .map(el => el.closest('a'))
      .find(a => a && a.href.includes('docs.google.com'));
    expect(link).toBeTruthy();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('docs.google.com')
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
