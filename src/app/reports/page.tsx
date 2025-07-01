'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PowerBIReport from '@/components/reports/PowerBIReport';
import { useAuth } from '@/contexts/AuthContext';
import powerBiService, { PowerBIReport as PowerBIReportType } from '@/services/powerBiService';

function ReportsPageContent() {
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<PowerBIReportType[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardLayout, setDashboardLayout] = useState<'single' | 'grid' | 'tabs'>('single');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Load available reports
  useEffect(() => {
    const loadReports = async () => {
      if (!powerBiService.isConfigured()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const availableReports = await powerBiService.getReports();
        setReports(availableReports);
        
        if (availableReports.length > 0) {
          setSelectedReportId(availableReports[0].id);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  // Mock reports for demo purposes when Power BI is not configured
  const mockReports: PowerBIReportType[] = [
    {
      id: 'demo-sales-report',
      name: 'Sales Performance Dashboard',
      embedUrl: '#',
      datasetId: 'demo-dataset-1',
      isReadOnly: true,
    },
    {
      id: 'demo-user-analytics',
      name: 'User Analytics Report',
      embedUrl: '#',
      datasetId: 'demo-dataset-2',
      isReadOnly: true,
    },
    {
      id: 'demo-document-usage',
      name: 'Document Usage Statistics',
      embedUrl: '#',
      datasetId: 'demo-dataset-3',
      isReadOnly: true,
    },
  ];

  const displayReports = powerBiService.isConfigured() ? reports : mockReports;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-warning-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">Analytics & Reports</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.photoURL ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <a href="/dashboard" className="btn-outline btn-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </a>
                <a href="/documents" className="btn-outline btn-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documents
                </a>
                {user?.role === 'admin' && (
                  <a href="/admin" className="btn-outline btn-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </a>
                )}
                <button onClick={handleSignOut} className="btn-outline btn-sm">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Phase 3 Progress Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Business Intelligence Dashboard
                  </h2>
                  <p className="text-warning-100">
                    Advanced analytics and reporting with Power BI integration for data-driven insights.
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <div className="w-2 h-2 bg-warning-300 rounded-full animate-pulse"></div>
                    <span>Phase 3 - Sprint 5.2</span>
                  </div>
                  <div className="text-xs text-warning-200">
                    Dashboard Development
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Controls */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Report
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="input w-64"
                  disabled={loading}
                >
                  <option value="">Select a report...</option>
                  {displayReports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout
                </label>
                <select
                  value={dashboardLayout}
                  onChange={(e) => setDashboardLayout(e.target.value as any)}
                  className="input w-32"
                >
                  <option value="single">Single</option>
                  <option value="grid">Grid</option>
                  <option value="tabs">Tabs</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="btn-outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
              
              <button className="btn-outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-error-50 border border-error-200 rounded-md p-4">
              <p className="text-sm text-error-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-error-800 hover:text-error-900 text-sm font-medium mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Reports Dashboard */}
          {selectedReportId ? (
            <div className="space-y-6">
              {dashboardLayout === 'single' && (
                <PowerBIReport
                  reportId={selectedReportId}
                  height="700px"
                  className="w-full"
                  onLoad={() => console.log('Report loaded')}
                  onError={(error) => setError(error)}
                />
              )}

              {dashboardLayout === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PowerBIReport
                    reportId={selectedReportId}
                    height="400px"
                    className="w-full"
                    onLoad={() => console.log('Report 1 loaded')}
                    onError={(error) => setError(error)}
                  />
                  {displayReports.length > 1 && (
                    <PowerBIReport
                      reportId={displayReports[1].id}
                      height="400px"
                      className="w-full"
                      onLoad={() => console.log('Report 2 loaded')}
                      onError={(error) => setError(error)}
                    />
                  )}
                </div>
              )}

              {dashboardLayout === 'tabs' && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {displayReports.map((report, index) => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            selectedReportId === report.id
                              ? 'border-warning-500 text-warning-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {report.name}
                        </button>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="p-6">
                    <PowerBIReport
                      reportId={selectedReportId}
                      height="600px"
                      className="w-full"
                      onLoad={() => console.log('Tab report loaded')}
                      onError={(error) => setError(error)}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Report Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a report from the dropdown above to view analytics and insights.
              </p>
            </div>
          )}

          {/* Report Information */}
          {selectedReportId && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Report Information</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Name:</dt>
                    <dd className="text-gray-900">
                      {displayReports.find(r => r.id === selectedReportId)?.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type:</dt>
                    <dd className="text-gray-900">Power BI Report</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status:</dt>
                    <dd className="text-success-600">Active</dd>
                  </div>
                </dl>
              </div>

              <div className="card">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Data Refresh</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Last Updated:</dt>
                    <dd className="text-gray-900">2 hours ago</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Frequency:</dt>
                    <dd className="text-gray-900">Every 4 hours</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Next Refresh:</dt>
                    <dd className="text-gray-900">In 2 hours</dd>
                  </div>
                </dl>
              </div>

              <div className="card">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Access Control</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Your Access:</dt>
                    <dd className="text-gray-900">Viewer</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Data Scope:</dt>
                    <dd className="text-gray-900">Department</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Filters:</dt>
                    <dd className="text-primary-600">Applied</dd>
                  </div>
                </dl>
              </div>
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