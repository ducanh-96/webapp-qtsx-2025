'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type UserAvatarProps = {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

const DefaultUserSVG = ({
  className = '',
  width = 112,
  height = 112,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 112 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="56" cy="56" r="56" fill="#E5E7EB" />
    <circle cx="56" cy="46" r="21" fill="#9CA3AF" />
    <path
      d="M56 70c-18 0-32.4 9-32.4 18v3.6h64.8V88c0-9-14.4-18-32.4-18z"
      fill="#9CA3AF"
    />
  </svg>
);

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  className,
  width = 112,
  height = 112,
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (!src || src.trim() === '' || imgError) {
    return (
      <DefaultUserSVG className={className} width={width} height={height} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="eager"
      onError={() => setImgError(true)}
      style={{
        objectFit: 'cover',
        borderRadius: '9999px',
        border: '4px solid #BFDBFE',
        boxShadow: '0 2px 8px #0001',
      }}
    />
  );
};

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-600">Bạn chưa đăng nhập.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditing(true);
    setShowPasswordForm(false);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setDisplayName(user.displayName || '');
    setPhotoURL(user.photoURL || '');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updateData: { displayName?: string; photoURL?: string } = {};
      updateData.displayName =
        displayName.trim() === '' ? user.displayName ?? undefined : displayName;
      updateData.photoURL =
        photoURL.trim() === '' ? user.photoURL ?? undefined : photoURL;
      await updateUserProfile(updateData);
      setSuccess('Cập nhật thành công!');
      setEditing(false);
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Cập nhật thất bại');
      } else {
        setError('Cập nhật thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường.');
      setPasswordLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      setPasswordLoading(false);
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu cũ.');
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu không khớp.');
      setPasswordLoading(false);
      return;
    }

    try {
      const {
        updatePassword,
        getAuth,
        EmailAuthProvider,
        reauthenticateWithCredential,
      } = await import('firebase/auth');
      if (!user) throw new Error('Chưa đăng nhập');
      const auth = getAuth();
      if (!auth.currentUser)
        throw new Error('Không tìm thấy tài khoản đăng nhập');
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err && typeof err === 'object') {
        const code = (err as { code?: string }).code;
        const message = (err as { message?: string }).message;
        if (code === 'auth/wrong-password') {
          setPasswordError('Mật khẩu cũ không đúng. Vui lòng kiểm tra lại.');
        } else if (code === 'auth/weak-password') {
          setPasswordError(
            'Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn (bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).'
          );
        } else if (code === 'auth/too-many-requests') {
          setPasswordError(
            'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.'
          );
        } else if (
          code === 'auth/password-does-not-meet-requirements' ||
          (typeof message === 'string' &&
            message.includes('Missing password requirements'))
        ) {
          setPasswordError(
            'Mật khẩu mới phải có chữ hoa, chữ thường, số và ký tự đặc biệt.'
          );
        } else {
          setPasswordError(
            'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại yêu cầu về mật khẩu hoặc thử lại sau.'
          );
        }
      } else {
        setPasswordError(
          'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại yêu cầu về mật khẩu hoặc thử lại sau.'
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // UI
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-lg flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <UserAvatar
            src={user.photoURL || undefined}
            alt={user.displayName || 'User'}
            className="w-28 h-28"
            width={112}
            height={112}
          />
          <span className="font-bold text-2xl mt-3 text-blue-800">
            {user.displayName || 'Chưa đặt tên'}
          </span>
        </div>
        <div className="w-full mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Email:</span>
            <span className="text-gray-800">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Nhà máy:</span>
            <span className="text-gray-800">
              {user.nhaMay || 'Chưa cập nhật'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Trạng thái:</span>
            <span
              className={
                user.isActive === false ? 'text-red-600' : 'text-green-600'
              }
            >
              {user.isActive === false ? 'Không hoạt động' : 'Hoạt động'}
            </span>
          </div>
        </div>
        {/* Action buttons */}
        {!editing && !showPasswordForm && (
          <div className="flex flex-col gap-3 w-full mt-6">
            <button
              className="px-6 py-2 bg-[#ea2227] text-white rounded-full font-semibold shadow hover:bg-[#c41c22] transition border border-[#ea2227]"
              onClick={handleEdit}
            >
              Cập nhật thông tin
            </button>
            <button
              className="px-6 py-2 bg-white text-[#ea2227] rounded-full font-semibold shadow hover:bg-[#fff2f2] transition border border-[#ea2227]"
              onClick={() => {
                setShowPasswordForm(true);
                setEditing(false);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
            >
              Đổi mật khẩu
            </button>
          </div>
        )}
        {/* Edit profile form */}
        {editing && (
          <form className="mt-4 w-full animate-fade-in" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">
                Tên hiển thị
              </label>
              <input
                type="text"
                className="w-full border-2 border-blue-200 rounded px-3 py-2 focus:outline-none focus:border-blue-400 transition"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                disabled={loading}
                placeholder="Nhập tên hiển thị"
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">
                Ảnh đại diện (URL)
              </label>
              <input
                type="text"
                className="w-full border-2 border-blue-200 rounded px-3 py-2 focus:outline-none focus:border-blue-400 transition"
                value={photoURL}
                onChange={e => setPhotoURL(e.target.value)}
                disabled={loading}
                placeholder="Dán URL ảnh đại diện"
              />
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}
            <div className="flex gap-3 mt-2 justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#ea2227] text-white rounded-full font-semibold shadow hover:bg-[#c41c22] transition border border-[#ea2227]"
                disabled={loading}
              >
                Lưu
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
        {/* Change password form */}
        {showPasswordForm && (
          <form
            className="mt-4 w-full animate-fade-in"
            onSubmit={handlePasswordUpdate}
          >
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">
                Mật khẩu cũ
              </label>
              <input
                type="password"
                className="w-full border-2 border-orange-200 rounded px-3 py-2 focus:outline-none focus:border-orange-400 transition"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                disabled={passwordLoading}
                placeholder="Nhập mật khẩu cũ"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full border-2 border-orange-200 rounded px-3 py-2 focus:outline-none focus:border-orange-400 transition"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={passwordLoading}
                placeholder="Nhập mật khẩu mới"
                minLength={6}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full border-2 border-orange-200 rounded px-3 py-2 focus:outline-none focus:border-orange-400 transition"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                placeholder="Xác nhận mật khẩu mới"
                minLength={6}
                required
              />
            </div>
            {passwordError && (
              <div className="text-red-600 mb-2">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-green-600 mb-2">{passwordSuccess}</div>
            )}
            <div className="flex gap-3 mt-2 justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#ea2227] text-white rounded-full font-semibold shadow hover:bg-[#c41c22] transition border border-[#ea2227]"
                disabled={passwordLoading}
              >
                Lưu mật khẩu
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition"
                onClick={() => setShowPasswordForm(false)}
                disabled={passwordLoading}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
