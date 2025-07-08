# Checklist cập nhật & hoàn thiện file test Jest

**Mục tiêu:** Đảm bảo tất cả các file test Jest phản ánh đúng logic, UI và chức năng thực tế của hệ thống sau các thay đổi lớn về xác thực, quên mật khẩu, xác thực email, Google Drive...

---

## 1. Tổng hợp các file test cần kiểm tra/cập nhật

- [ ] `src/components/auth/__tests__/LoginForm.test.tsx`
- [x] `src/components/auth/__tests__/LoginForm.test.tsx` (Đã cập nhật mock AuthContext, bổ sung các hàm mới, hướng dẫn sửa matcher jest-dom)
- [ ] `src/services/__tests__/cacheService.test.ts`
- [ ] `src/services/__tests__/securityService.test.ts`
- [ ] (Bổ sung các file test khác nếu có)

---

## 2. Task chi tiết cho từng file test

### 2.1. `src/components/auth/__tests__/LoginForm.test.tsx`

- [ ] Mock lại AuthContext với các hàm mới: resendEmailVerification, sendPasswordReset.
- [ ] Thêm test cho luồng xác thực email:
  - Đăng nhập với email chưa xác thực, kiểm tra hiển thị cảnh báo và nút gửi lại email xác thực.
  - Test gửi lại email xác thực thành công/thất bại.
- [ ] Thêm test cho modal Quên mật khẩu:
  - Hiển thị modal khi click "Forgot your password?"
  - Gửi email quên mật khẩu thành công/thất bại.
- [ ] Đảm bảo test không bị fail do thay đổi props hoặc UI mới.

### 2.2. `src/services/__tests__/cacheService.test.ts`

- [ ] Đảm bảo test phản ánh đúng logic cache hiện tại (nếu có thay đổi).

### 2.3. `src/services/__tests__/securityService.test.ts`

- [ ] Đảm bảo test phản ánh đúng logic bảo mật hiện tại (nếu có thay đổi).

---

## 3. Task tổng quát

- [ ] Chạy toàn bộ test với `npm test` hoặc `yarn test` và sửa các lỗi phát sinh.
- [ ] Đảm bảo coverage đạt tối thiểu 80% cho các module auth, quên mật khẩu, xác thực email.
- [ ] Review lại các mock, spy, fake API cho phù hợp với logic mới (Firebase Auth, Google API...).

---

**Ghi chú:**

- Khi cập nhật xong từng file test, hãy tick vào checklist trên.
- Nếu có file test mới hoặc cần bổ sung, hãy thêm vào danh sách trên.

---

**Người thực hiện:**

- [ ] AnhND hoặc developer phụ trách test

**Ngày cập nhật:** 07/03/2025
