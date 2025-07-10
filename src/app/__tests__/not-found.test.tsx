// Unit and integration tests for src/app/not-found.tsx

import React from 'react';
import { render } from '@testing-library/react';
import NotFound from '../not-found';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('NotFound', () => {
  let replaceMock: jest.Mock;

  beforeEach(() => {
    replaceMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls router.replace with "/error-404" on mount', () => {
    render(<NotFound />);
    expect(replaceMock).toHaveBeenCalledWith('/error-404');
  });

  it('renders nothing', () => {
    const { container } = render(<NotFound />);
    expect(container).toBeEmptyDOMElement();
  });

  it('handles router errors gracefully', () => {
    (useRouter as jest.Mock).mockReturnValue({
      replace: () => {
        throw new Error('Router error');
      },
    });
    expect(() => render(<NotFound />)).not.toThrow();
  });

  it('does not call replace if router is undefined', () => {
    (useRouter as jest.Mock).mockReturnValue(undefined);
    expect(() => render(<NotFound />)).not.toThrow();
  });
});
