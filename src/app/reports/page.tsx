'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PowerBIIframe from '@/components/reports/PowerBIIframe';

interface PowerBIReportInfo {
  id: string;
  name: string;
  url: string;
  description?: string;
}

function ReportsPageContent() {
  // const { user, signOut } = useAuth(); // user, signOut are currently unused
  const [reports, setReports] = useState<PowerBIReportInfo[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  // const [loading] = useState(false); // loading is unused
  const [error, setError] = useState<string | null>(null);

  // Height state lifted up
  const [dynamicHeight, setDynamicHeight] = useState<string>('80vh');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevHeight, setPrevHeight] = useState<string>('80vh');

  useEffect(() => {
    const powerBiReports: PowerBIReportInfo[] = [
      {
        id: 'san-luong',
        name: 'Sản Lượng',
        url:
          process.env.NEXT_PUBLIC_POWERBI_SAN_LUONG ??
          process.env.NEXT_PUBLIC_POWERBI_BLANK_REPORT ??
          '',
        description: 'Báo cáo Sản Lượng',
      },
      {
        id: 'bc-nhan-cong',
        name: 'BC Nhân Công',
        url:
          process.env.NEXT_PUBLIC_POWERBI_BC_NHAN_CONG ??
          process.env.NEXT_PUBLIC_POWERBI_BLANK_REPORT ??
          '',
        description: 'Báo cáo BC Nhân Công',
      },
      {
        id: 'shop-drawing',
        name: 'Shop Drawing',
        url:
          process.env.NEXT_PUBLIC_POWERBI_SHOP_DRAWING ??
          process.env.NEXT_PUBLIC_POWERBI_BLANK_REPORT ??
          '',
        description: 'Báo cáo Shop Drawing',
      },
      {
        id: 'mmtb',
        name: 'MMTB',
        url:
          process.env.NEXT_PUBLIC_POWERBI_MMTB ??
          process.env.NEXT_PUBLIC_POWERBI_BLANK_REPORT ??
          '',
        description: 'Báo cáo MMTB',
      },
      {
        id: 'bc-cp-sx',
        name: 'BC CP SX',
        url:
          process.env.NEXT_PUBLIC_POWERBI_BC_CP_SX ??
          process.env.NEXT_PUBLIC_POWERBI_BLANK_REPORT ??
          '',
        description: 'Báo cáo BC CP SX',
      },
      {
        id: 'vat-tu-chinh',
        name: 'Vật Tư Chính',
        url:
          process.env.NEXT_PUBLIC_POWERBI_VAT_TU_CHINH ??
          process.env.NEXT_PUBLIC_POWERBI_BLANK_REPORT ??
          '',
        description: 'Báo cáo Vật Tư Chính',
      },
    ];

    setReports(powerBiReports);
    if (powerBiReports.length > 0) {
      setSelectedReportId(powerBiReports[0].id);
    }
  }, []);

  // Fullscreen handlers
  const handleEnterFullscreen = () => {
    setPrevHeight(dynamicHeight);
    setDynamicHeight('100vh');
    setIsFullscreen(true);
  };
  const handleExitFullscreen = () => {
    setDynamicHeight(prevHeight);
    setIsFullscreen(false);
  };

  const displayReports = reports;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-gray-50">
      <main className="flex-1 flex flex-col min-h-0 w-full p-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Error Message */}
          {error && (
            <div className="mb-2 bg-error-50 border border-error-200 rounded-md p-2">
              <p className="text-xs text-error-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-error-800 hover:text-error-900 text-xs font-medium mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Reports Dashboard */}
          {selectedReportId ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Only show 'tabs' layout */}
              <div className="flex-1 flex flex-col min-h-0">
                <div
                  className="border-b border-gray-200 overflow-x-auto flex-shrink-0"
                  style={{ minHeight: 36, height: 40 }}
                >
                  <div className="flex flex-row items-center justify-between px-4">
                    <nav className="-mb-px flex flex-nowrap space-x-2 sm:space-x-4">
                      {displayReports.map((report, _index) => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          className={`py-1 sm:py-2 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                            selectedReportId === report.id
                              ? 'border-b-2 border-[#ea2227] text-[#ea2227]'
                              : 'border-b-2 border-transparent text-gray-500 hover:text-[#ea2227] hover:border-[#ea2227]'
                          }`}
                        >
                          {report.name}
                        </button>
                      ))}
                    </nav>
                    <div className="flex items-center gap-2 ml-4">
                      <label
                        htmlFor="iframe-height-tabs"
                        className="text-xs text-gray-600"
                      >
                        Chiều cao báo cáo:
                      </label>
                      <input
                        id="iframe-height-tabs"
                        type="range"
                        min={40}
                        max={100}
                        value={isFullscreen ? 100 : parseInt(dynamicHeight)}
                        disabled={isFullscreen}
                        onChange={e => setDynamicHeight(e.target.value + 'vh')}
                        className="w-32 accent-[#ea2227]"
                      />
                      <span className="text-xs text-[#ea2227]">
                        {isFullscreen ? '100%' : `${parseInt(dynamicHeight)}%`}
                      </span>
                      <button
                        type="button"
                        aria-label="Fit height to page"
                        className="p-1 rounded hover:bg-gray-100 ml-2"
                        style={{ color: '#ea2227' }}
                        onClick={() => setDynamicHeight('100vh')}
                        tabIndex={0}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="6"
                            width="14"
                            height="8"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M7 10h6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0 p-0">
                  <PowerBIIframe
                    reportUrl={
                      displayReports.find(r => r.id === selectedReportId)
                        ?.url || ''
                    }
                    title={
                      displayReports.find(r => r.id === selectedReportId)
                        ?.name || 'Power BI Report'
                    }
                    height={dynamicHeight}
                    className="w-full h-full min-h-0"
                    onLoad={() => console.log('Tab report loaded')}
                    onError={error => setError(error)}
                    dynamicHeight={dynamicHeight}
                    isFullscreen={isFullscreen}
                    onEnterFullscreen={handleEnterFullscreen}
                    onExitFullscreen={handleExitFullscreen}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 sm:py-8">
              <svg
                className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400"
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
              <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">
                No Report Selected
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Choose a report from the tabs above to view analytics and
                insights.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsPageContent />
    </ProtectedRoute>
  );
}
