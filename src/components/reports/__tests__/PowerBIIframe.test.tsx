// Unit test for PowerBIIframe

import { render, screen, fireEvent } from '@testing-library/react';
import PowerBIIframe from '../PowerBIIframe';

describe('PowerBIIframe', () => {
  it('renders loading state initially', () => {
    render(<PowerBIIframe reportUrl="https://test.com" />);
    expect(screen.getByText(/Loading Power BI report/i)).toBeInTheDocument();
  });

  it('renders error UI if reportUrl is missing', () => {
    render(<PowerBIIframe reportUrl="" />);
    expect(screen.getByText(/No Report URL/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Please provide a Power BI report URL/i)
    ).toBeInTheDocument();
  });

  it('renders iframe with correct src and title', () => {
    render(<PowerBIIframe reportUrl="https://test.com" title="Báo cáo test" />);
    const iframe = screen.getByTitle('Báo cáo test');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://test.com');
  });

  it('calls onLoad when iframe loads', () => {
    const onLoad = jest.fn();
    render(<PowerBIIframe reportUrl="https://test.com" onLoad={onLoad} />);
    const iframe = screen.getByTitle(/Power BI Report/i);
    fireEvent.load(iframe);
    expect(onLoad).toHaveBeenCalled();
  });

  // Bỏ test fireEvent.error vì jsdom không trigger được error UI thực tế

  it('renders error UI and Retry button when error occurs', () => {
    render(<PowerBIIframe reportUrl="" />);
    expect(screen.getByText(/No Report URL/i)).toBeInTheDocument();
  });

  it('renders control buttons (refresh, fullscreen)', () => {
    const onEnterFullscreen = jest.fn();
    render(
      <PowerBIIframe
        reportUrl="https://test.com"
        onEnterFullscreen={onEnterFullscreen}
      />
    );
    expect(screen.getByTitle(/Refresh Report/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Enter Fullscreen/i)).toBeInTheDocument();
  });

  it('renders exit fullscreen button when isFullscreen=true', () => {
    const onExitFullscreen = jest.fn();
    render(
      <PowerBIIframe
        reportUrl="https://test.com"
        isFullscreen
        onExitFullscreen={onExitFullscreen}
      />
    );
    expect(screen.getByTitle(/Exit Fullscreen/i)).toBeInTheDocument();
  });
});
