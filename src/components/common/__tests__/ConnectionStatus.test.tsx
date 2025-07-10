// Unit test for ConnectionStatus

import { render, screen } from '@testing-library/react';
import ConnectionStatus from '../ConnectionStatus';
import * as firestore from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  enableNetwork: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/config/firebase', () => ({
  db: {},
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when online and Firebase is online', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
    render(<ConnectionStatus />);
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Database connection issue/i)
    ).not.toBeInTheDocument();
  });

  it('shows offline message when browser is offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });
    render(<ConnectionStatus />);
    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });

  it('shows Firebase connection issue when enableNetwork fails', async () => {
    jest
      .spyOn(firestore, 'enableNetwork')
      .mockImplementationOnce(() => Promise.reject('error'));
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
    render(<ConnectionStatus />);
    // Wait for effect
    await new Promise(r => setTimeout(r, 10));
    expect(screen.getByText(/Database connection issue/i)).toBeInTheDocument();
  });
});
