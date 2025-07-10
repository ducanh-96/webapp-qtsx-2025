'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import powerBiService, { EmbedConfiguration } from '@/services/powerBiService';

interface PowerBIReportProps {
  reportId: string;
  className?: string;
  height?: string;
  filters?: unknown[];
  onLoad?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    powerbi: any;
  }
}

const PowerBIReport: React.FC<PowerBIReportProps> = ({
  reportId,
  className = '',
  height = '600px',
  // filters is unused, so remove from destructuring
  onLoad,
  onError,
}) => {
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedConfig, setEmbedConfig] = useState<EmbedConfiguration | null>(
    null
  );
  const [reportInstance, setReportInstance] = useState<unknown>(null);

  // Load Power BI JavaScript SDK
  useEffect(() => {
    const loadPowerBIScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.powerbi) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.powerbi.com/lib/powerbi.js';
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error('Failed to load Power BI script'));
        document.head.appendChild(script);
      });
    };

    loadPowerBIScript().catch(error => {
      setError('Failed to load Power BI SDK');
      onError?.(error.message);
    });
  }, [onError]);

  // Create embed configuration
  useEffect(() => {
    const createEmbedConfig = async () => {
      if (!user || !reportId) return;

      try {
        setLoading(true);
        setError(null);

        // Build embed configuration directly (iframe-only, no accessToken)
        const embedConfig: EmbedConfiguration = {
          type: 'report',
          id: reportId,
          embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${process.env.NEXT_PUBLIC_POWER_BI_WORKSPACE_ID}`,
          accessToken: '', // Not used for iframe-only
          tokenType: 0,
          settings: {
            panes: {
              filters: {
                expanded: false,
                visible: false,
              },
              pageNavigation: {
                visible: true,
              },
            },
            background: 0,
            layoutType: 1,
            displayOption: 1,
          },
          permissions: 7,
          filters: powerBiService.createUserFilters(
            user.id,
            user.role ?? '',
            user.department
          ),
        };

        setEmbedConfig(embedConfig);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create embed configuration';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createEmbedConfig();
  }, [user, reportId, onError]);

  // Embed the report
  useEffect(() => {
    // Copy ref to local variable at effect start
    const container = reportRef.current;

    const embedReport = async () => {
      if (!embedConfig || !container || !window.powerbi) return;

      try {
        // Reset the container
        container.innerHTML = '';

        // Embed the report
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const report = (window.powerbi as any).embed(container, embedConfig);
        setReportInstance(report);

        // Handle events
        report.on('loaded', () => {
          console.log('Power BI report loaded successfully');
          onLoad?.();
        });

        report.on('rendered', () => {
          console.log('Power BI report rendered successfully');
        });

        report.on('error', (event: unknown) => {
          const errorMessage =
            typeof event === 'object' &&
            event &&
            'detail' in event &&
            (event as { detail?: { message?: string } }).detail?.message
              ? (event as { detail?: { message?: string } }).detail?.message
              : 'Power BI report error';
          console.error(
            'Power BI report error:',
            (event as { detail?: unknown }).detail
          );
          setError(errorMessage || 'Power BI report error');
          onError?.(errorMessage || 'Power BI report error');
        });

        report.on('dataSelected', (event: unknown) => {
          if (typeof event === 'object' && event && 'detail' in event) {
            console.log(
              'Data selected in Power BI report:',
              (event as { detail?: unknown }).detail
            );
          }
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to embed Power BI report';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    embedReport();

    // Cleanup function
    return () => {
      if (reportInstance && container) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.powerbi as any).reset(container);
        } catch (error) {
          console.warn('Error resetting Power BI report:', error);
        }
      }
    };
  }, [embedConfig, onLoad, onError, reportInstance]);

  // Apply filters
  // Removed unused applyFilters function to fix lint error

  // Refresh report
  const refreshReport = async () => {
    if (!reportInstance) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (reportInstance as any).refresh();
    } catch (error) {
      console.error('Error refreshing report:', error);
    }
  };

  // Export report
  const exportReport = async (format: 'PDF' | 'PNG' | 'PPTX') => {
    if (!reportInstance) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exportData = await (reportInstance as any).exportData(format);

      // Create download link
      const blob = new Blob([exportData.data], { type: exportData.type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (!powerBiService.isConfigured()) {
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
            Power BI Not Configured
          </h3>
          <p className="text-gray-500 mb-4">
            Power BI credentials are not configured.
          </p>
          <p className="text-sm text-gray-400">
            Please configure Power BI environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Power BI report...</p>
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
            onClick={() => window.location.reload()}
            className="btn-outline text-error-600 border-error-600 hover:bg-error-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Report Controls */}
      <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-t-lg border border-b-0 border-gray-200">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-gray-900">Power BI Report</h3>
          {/* <div className="flex items-center space-x-1 text-xs text-success-600">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>Live Data</span>
          </div> */}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshReport}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Refresh Report"
          >
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <div className="relative group">
            <button
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
              title="Export Report"
            >
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>

            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => exportReport('PDF')}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportReport('PNG')}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export PNG
              </button>
              <button
                onClick={() => exportReport('PPTX')}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export PPTX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Container */}
      <div
        ref={reportRef}
        className="w-full border border-gray-200 rounded-b-lg"
        style={{ height }}
      />
    </div>
  );
};

export default PowerBIReport;
