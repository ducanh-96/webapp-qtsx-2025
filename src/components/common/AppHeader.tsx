'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

type UserAvatarProps = {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

const DefaultUserSVG = ({
  className = '',
  width = 32,
  height = 32,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="16" fill="#E5E7EB" />
    <circle cx="16" cy="13" r="6" fill="#9CA3AF" />
    <path d="M16 20c-5 0-9 2.5-9 5v1h18v-1c0-2.5-4-5-9-5z" fill="#9CA3AF" />
  </svg>
);

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  className,
  width = 32,
  height = 32,
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (!src || imgError) {
    return (
      <DefaultUserSVG className={className} width={width} height={height} />
    );
  }

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      onError={() => setImgError(true)}
    />
  );
};

interface AppHeaderProps {
  hideHeaderText?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ hideHeaderText }) => {
  const { user, signOut } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const handleSignOut = async () => {
    setShowUserDropdown(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleViewProfile = () => {
    setShowUserDropdown(false);
    window.location.href = '/profile';
  };

  // Đã loại bỏ chức năng Update Profile vì đã tích hợp vào View Profile

  return (
    <nav
      className="bg-[#ea2227] border-b border-gray-200 flex-shrink-0"
      style={{ minHeight: 48, height: 48 }}
    >
      <div className="w-full px-4">
        <div className="flex flex-row justify-between items-center h-12">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isHome ? (
                <span>
                  <Image
                    src="/logo.png"
                    alt="Company Logo"
                    width={48}
                    height={45}
                    className="h-[45px] w-12 sm:h-[45px] sm:w-12 rounded-lg object-contain"
                    priority
                  />
                </span>
              ) : (
                <span>
                  <Image
                    src="/logo.png"
                    alt="Company Logo"
                    width={48}
                    height={45}
                    className="h-[45px] w-12 sm:h-[45px] sm:w-12 rounded-lg object-contain"
                    priority
                  />
                </span>
              )}
            </div>
            <div className="ml-2 sm:ml-4">
              {!hideHeaderText && (
                <span className="text-base sm:text-lg font-semibold text-white">
                  {pathname === '/'
                    ? 'Báo cáo Quản trị Sản xuất'
                    : pathname === '/he-thong-ghi-nhan'
                    ? 'Hệ thống ghi nhận'
                    : pathname.startsWith('/admin')
                    ? 'Cửa sổ quản trị viên'
                    : pathname.startsWith('/profile')
                    ? 'Chi tiết thông tin người dùng'
                    : 'Báo cáo Quản trị Sản xuất'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Info Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none group"
                id="user-menu"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={() => setShowUserDropdown(v => !v)}
                type="button"
              >
                <UserAvatar
                  className="h-8 w-8 rounded-full"
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || 'User'}
                  width={32}
                  height={32}
                />
                <span className="hidden md:block text-sm font-medium text-white">
                  {user?.displayName || user?.email || 'User'}
                </span>
                <svg
                  className="w-4 h-4 text-gray-500 group-hover:text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">
                      {user?.email}
                    </div>
                    <Link
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Báo cáo Quản trị Sản xuất
                    </Link>
                    <Link
                      href="/he-thong-ghi-nhan"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Hệ thống Ghi nhận
                    </Link>
                    <a
                      href="https://script.google.com/macros/s/AKfycbzfx31v_rphNEaZhVs3thaKP6Nd4vlgACp3TBBT0hHchaoF-B7M4eu11J6c4djyZ-i2/exec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Hệ thống BC QTSC Dự Án
                    </a>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleViewProfile}
                    >
                      Thông tin tài khoản
                    </button>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Quản trị viên
                      </Link>
                    )}
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                      onClick={handleSignOut}
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
export { UserAvatar, DefaultUserSVG };
