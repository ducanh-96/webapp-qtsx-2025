'use client';

import React, { useState, useEffect } from 'react';

interface PowerBIIframeProps {
  reportUrl: string;
  className?: string;
  height?: string;
  title?: string;
  allowFullscreen?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  dynamicHeight?: string;
  isFullscreen?: boolean;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
}

const PowerBIIframe: React.FC<PowerBIIframeProps> = ({
  reportUrl,
  className = '',
  height = '600px',
  title = 'Power BI Report',
  allowFullscreen = true,
  onLoad,
  onError,
  dynamicHeight = '80vh',
  isFullscreen = false,
  onEnterFullscreen,
  onExitFullscreen,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportUrl) {
      setError('Report URL is required');
      setLoading(false);
      onError?.('Report URL is required');
    }
  }, [reportUrl, onError]);

  const handleIframeLoad = () => {
    setLoading(false);
    // Hide logoBar inside iframe after load
    try {
      const iframe = document.getElementById(
        'powerbi-iframe'
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        const logoBar = iframe.contentDocument.querySelector(
          '.logoBar'
        ) as HTMLElement;
        if (logoBar) {
          logoBar.style.display = 'none';
        }
      }
    } catch {
      // Cross-origin, fallback to CSS injection
      try {
        const iframe = document.getElementById(
          'powerbi-iframe'
        ) as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'hideLogoBar' }, '*');
        }
      } catch {}
    }
    onLoad?.();
  };

  const handleIframeError = () => {
    const errorMessage = 'Failed to load Power BI report';
    setError(errorMessage);
    setLoading(false);
    onError?.(errorMessage);
  };

  const refreshReport = () => {
    setLoading(true);
    setError(null);
    // Force iframe reload by updating src
    const iframe = document.getElementById(
      'powerbi-iframe'
    ) as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  };

  if (!reportUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Report URL
          </h3>
          <p className="text-gray-500 mb-4">
            Please provide a Power BI report URL to display.
          </p>
          <p className="text-sm text-gray-400">
            Contact your administrator to get the report URL.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-error-50 border border-error-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-error-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-error-900 mb-2">
            Report Load Failed
          </h3>
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={refreshReport}
            className="btn-outline text-error-600 border-error-600 hover:bg-error-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col min-h-0 ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
      }`}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Power BI report...</p>
          </div>
        </div>
      )}
      {/* Power BI Iframe */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          style={{
            height: dynamicHeight,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <iframe
            id="powerbi-iframe"
            src={reportUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen={allowFullscreen}
            title={title}
            className="w-full border-none"
            style={{ height: '100%' }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
          {/* Overlay to cover logoBar and show controls */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: 36,
              background: '#fff',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1rem',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <div className="flex items-center space-x-1 text-xs text-success-600">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>Live Data</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshReport}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                title="Refresh Report"
                disabled={loading}
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {allowFullscreen && (
                <button
                  onClick={isFullscreen ? onExitFullscreen : onEnterFullscreen}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIIframe;

// Global CSS fallback for logoBar (in case of cross-origin)
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `.logoBar { display: none !important; }`;
  document.head.appendChild(style);
}
