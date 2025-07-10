'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import UserManagement from '@/components/admin/UserManagement';
import { useAuth } from '@/contexts/AuthContext';

interface HealthCheckResult {
  status: string;
  responseTime: number;
  error?: string;
  message?: string;
}
interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckResult;
    powerbi: HealthCheckResult;
    cache: HealthCheckResult;
    security: HealthCheckResult;
  };
  performance: {
    memoryUsage: { rss: number };
    responseTime: number;
  };
  security: {
    recentAlerts: number;
    activeSessions: number;
  };
}

function AdminDashboardContent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signOut } = useAuth();

  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'user' | 'settings' | 'logs' | 'api'
  >('user');

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealthData(data);
      } catch {
        setHealthData(null);
      }
      setLoading(false);
    };
    fetchHealth();
  }, []);

  const handleCardClick = (card: string) => {
    setSelectedCard(card);
  };

  const closeModal = () => setSelectedCard(null);

  // const handleSignOut = async () => {
  //   try {
  //     await signOut();
  //   } catch (error) {
  //     console.error('Sign out error:', error);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* System Health Card */}
            <div
              className="card cursor-pointer"
              onClick={() => handleCardClick('system')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    System Health
                  </p>
                  <p
                    className={`text-xl font-semibold ${
                      healthData?.status === 'healthy'
                        ? 'text-success-600'
                        : 'text-warning-600'
                    }`}
                  >
                    {loading
                      ? '...'
                      : healthData?.status === 'healthy'
                      ? 'Healthy'
                      : healthData?.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            {/* Database Card */}
            <div
              className="card cursor-pointer"
              onClick={() => handleCardClick('database')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-success-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Database</p>
                  <p
                    className={`text-xl font-semibold ${
                      healthData?.checks?.database?.status === 'healthy'
                        ? 'text-success-600'
                        : healthData?.checks?.database?.status === 'unhealthy'
                        ? 'text-error-600'
                        : 'text-warning-600'
                    }`}
                  >
                    {loading
                      ? '...'
                      : healthData?.checks?.database?.status === 'healthy'
                      ? 'Online'
                      : healthData?.checks?.database?.status === 'unhealthy'
                      ? 'Offline'
                      : healthData?.checks?.database?.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            {/* API Status Card */}
            <div
              className="card cursor-pointer"
              onClick={() => handleCardClick('api')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-warning-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    API Status
                  </p>
                  <p
                    className={`text-xl font-semibold ${
                      healthData?.checks?.powerbi?.status === 'healthy'
                        ? 'text-success-600'
                        : healthData?.checks?.powerbi?.status === 'unhealthy'
                        ? 'text-error-600'
                        : 'text-warning-600'
                    }`}
                  >
                    {loading
                      ? '...'
                      : healthData?.checks?.powerbi?.status === 'healthy'
                      ? 'Active'
                      : healthData?.checks?.powerbi?.status === 'unhealthy'
                      ? 'Inactive'
                      : healthData?.checks?.powerbi?.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Modal for card details */}
          {selectedCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedCard === 'system' && 'System Health Details'}
                  {selectedCard === 'database' && 'Database Details'}
                  {selectedCard === 'api' && 'API Status Details'}
                </h3>
                <div className="space-y-2 text-sm">
                  {selectedCard === 'system' && healthData && (
                    <>
                      <div>
                        Status:{' '}
                        <span className="font-semibold">
                          {healthData.status}
                        </span>
                      </div>
                      <div>
                        Uptime:{' '}
                        <span className="font-mono">
                          {Math.floor(healthData.uptime)}s
                        </span>
                      </div>
                      <div>
                        Version:{' '}
                        <span className="font-mono">{healthData.version}</span>
                      </div>
                      <div>
                        Environment:{' '}
                        <span className="font-mono">
                          {healthData.environment}
                        </span>
                      </div>
                      <div>
                        Memory Usage:{' '}
                        <span className="font-mono">
                          {healthData.performance?.memoryUsage?.rss} bytes RSS
                        </span>
                      </div>
                      <div>
                        Response Time:{' '}
                        <span className="font-mono">
                          {healthData.performance?.responseTime} ms
                        </span>
                      </div>
                    </>
                  )}
                  {selectedCard === 'database' && healthData && (
                    <>
                      <div>
                        Status:{' '}
                        <span className="font-semibold">
                          {healthData.checks?.database?.status}
                        </span>
                      </div>
                      <div>
                        Response Time:{' '}
                        <span className="font-mono">
                          {healthData.checks?.database?.responseTime} ms
                        </span>
                      </div>
                      {healthData.checks?.database?.error && (
                        <div className="text-error-600">
                          Error: {healthData.checks.database.error}
                        </div>
                      )}
                    </>
                  )}
                  {selectedCard === 'api' && healthData && (
                    <>
                      <div>
                        Status:{' '}
                        <span className="font-semibold">
                          {healthData.checks?.powerbi?.status}
                        </span>
                      </div>
                      <div>
                        Response Time:{' '}
                        <span className="font-mono">
                          {healthData.checks?.powerbi?.responseTime} ms
                        </span>
                      </div>
                      {healthData.checks?.powerbi?.message && (
                        <div>Message: {healthData.checks.powerbi.message}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  className={`py-4 px-1 border-b-2 ${
                    activeTab === 'user'
                      ? 'border-error-500 text-error-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'
                  }`}
                  onClick={() => setActiveTab('user')}
                >
                  User Management
                </button>
                <button
                  className={`py-4 px-1 border-b-2 ${
                    activeTab === 'settings'
                      ? 'border-error-500 text-error-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  System Settings
                </button>
                <button
                  className={`py-4 px-1 border-b-2 ${
                    activeTab === 'logs'
                      ? 'border-error-500 text-error-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'
                  }`}
                  onClick={() => setActiveTab('logs')}
                >
                  Audit Logs
                </button>
                <button
                  className={`py-4 px-1 border-b-2 ${
                    activeTab === 'api'
                      ? 'border-error-500 text-error-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'
                  }`}
                  onClick={() => setActiveTab('api')}
                >
                  API Health
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'user' && <UserManagement />}
              {activeTab === 'settings' && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    System Settings
                  </h4>
                  <p className="text-gray-600">
                    System settings management UI coming soon.
                  </p>
                </div>
              )}
              {activeTab === 'logs' && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Audit Logs</h4>
                  <p className="text-gray-600">Audit logs UI coming soon.</p>
                </div>
              )}
              {activeTab === 'api' && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">API Health</h4>
                  <p className="text-gray-600">
                    API health monitoring UI coming soon.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Admin Actions
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      User invitation sent
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-warning-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      System configuration updated
                    </p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-success-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Database backup completed
                    </p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Phase 2 Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                    <span>Sprint 3.1: User Management</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success-600 h-2 rounded-full"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                    <span>Sprint 3.2: Permission System</span>
                    <span>40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-warning-500 h-2 rounded-full"
                      style={{ width: '40%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
