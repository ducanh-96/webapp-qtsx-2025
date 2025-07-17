'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types';
import { userService } from '@/config/firestore';

interface UserManagementProps {
  className?: string;
}

export function getRoleBadgeColor(role: UserRole) {
  switch (role) {
    case UserRole.ADMIN:
      return 'badge-error';
    case UserRole.MANAGER:
      return 'badge-warning';
    case UserRole.USER:
      return 'badge-primary';
    default:
      return 'badge-secondary';
  }
}

interface UserFormData {
  email: string;
  displayName: string;
  role: UserRole;
  nhaMay?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className = '' }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  // Removed unused selectedUser state to fix lint error
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    role: UserRole.USER,
    nhaMay: '',
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.getUsers(50);
      setUsers(result.users);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to load users');
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create user in Firestore (actual user creation would be handled by backend)
      await userService.createUser({
        email: formData.email,
        displayName: formData.displayName,
        photoURL: null,
        role: formData.role,
        nhaMay: formData.nhaMay,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });

      // Reset form and close modal
      setFormData({
        email: '',
        displayName: '',
        role: UserRole.USER,
        nhaMay: '',
      });
      setShowInviteModal(false);

      // Reload users
      await loadUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Không thể mời người dùng');
      } else {
        setError('Không thể mời người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateUser = async (user: User, updates: Partial<User>) => {
  //   try {
  //     await userService.updateUser(user.uid, updates);
  //     await loadUsers();
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       setError(error.message || 'Failed to update user');
  //     } else {
  //       setError('Failed to update user');
  //     }
  //   }
  // };

  const handleDeactivateUser = async (user: User) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ngưng hoạt động người dùng ${
          user.displayName || user.email
        }?`
      )
    ) {
      try {
        await userService.deleteUser(user.id);
        await loadUsers();
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || 'Không thể ngưng hoạt động người dùng');
        } else {
          setError('Không thể ngưng hoạt động người dùng');
        }
      }
    }
  };

  // Việt hóa thông báo khi kích hoạt lại

  const handleActivateUser = async (user: User) => {
    try {
      await userService.updateUser(user.id, { isActive: true });
      await loadUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Không thể kích hoạt người dùng');
      } else {
        setError('Không thể kích hoạt người dùng');
      }
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h2>
          <p className="text-gray-600">
            Quản lý tài khoản, vai trò và quyền truy cập
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Mời người dùng
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <p className="text-sm text-error-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-error-800 hover:text-error-900 text-sm font-medium mt-2"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600"
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
                Tổng số người dùng
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-success-600"
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
              <p className="text-sm font-medium text-gray-500">
                Đang hoạt động
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Quản trị viên</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === UserRole.ADMIN).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-secondary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Quản lý</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === UserRole.MANAGER).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tất cả người dùng
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-sm overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nhà máy
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Đăng nhập cuối
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.photoURL ? (
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          width={40}
                          height={40}
                          unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.displayName?.charAt(0) ||
                              user.email.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || 'Không tên'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${getRoleBadgeColor(
                        user.role as UserRole
                      )}`}
                    >
                      {user.role === 'admin'
                        ? 'Quản trị viên'
                        : user.role === 'manager'
                        ? 'Quản lý'
                        : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.nhaMay || 'Chưa có'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        user.isActive ? 'badge-success' : 'badge-secondary'
                      }`}
                    >
                      {user.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {user.id !== currentUser?.id &&
                        (user.isActive ? (
                          <button
                            onClick={() => handleDeactivateUser(user)}
                            className="rounded px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user)}
                            className="rounded px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            Activate
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Mời người dùng mới
              </h3>

              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input w-full"
                    placeholder="nguoidung@congty.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={e =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <select
                    value={formData.role}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="input w-full"
                  >
                    <option value={UserRole.USER}>Người dùng</option>
                    <option value={UserRole.MANAGER}>Quản lý</option>
                    <option value={UserRole.ADMIN}>Quản trị viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhà máy (không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={formData.nhaMay}
                    onChange={e =>
                      setFormData({ ...formData, nhaMay: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Nhà máy A"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="btn-outline"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Đang mời...' : 'Gửi lời mời'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

{
  /* System Health Section */
}
<div className="mt-8 bg-white rounded-lg shadow p-4 flex flex-col items-center space-y-2">
  <h3 className="text-lg font-bold text-gray-900 mb-2">System Health</h3>
  <div className="flex flex-row space-x-8">
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-500">Database</span>
      <span className="text-green-600 font-semibold">Online</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-500">API Status</span>
      <span className="text-green-600 font-semibold">Active</span>
    </div>
  </div>
  <span className="mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
    Healthy
  </span>
</div>;
