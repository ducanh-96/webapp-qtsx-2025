// Unit test for src/app/documents/page.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentsPage from './page';

describe('DocumentsPage', () => {
  it('renders removal message', () => {
    render(<DocumentsPage />);
    expect(
      screen.getByText('Document Management feature has been removed.')
    ).toBeInTheDocument();
  });
});
