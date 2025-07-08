# Login Feature Analysis and Task Breakdown

## 1. Overview of Login Flows

### Email/Password Login

- User enters email and password in [`LoginForm`](../src/components/auth/LoginForm.tsx).
- [`handleEmailLogin`](../src/components/auth/LoginForm.tsx) calls `signInWithEmail` from [`AuthContext`](../src/contexts/AuthContext.tsx).
- `signInWithEmail` uses Firebase Auth (`signInWithEmailAndPassword`), syncs user info with Firestore, updates last login time, and updates state.

### Google Login

- User clicks Google button, triggering [`handleGoogleLogin`](../src/components/auth/LoginForm.tsx).
- This calls `signInWithGoogle` from [`AuthContext`](../src/contexts/AuthContext.tsx).
- `signInWithGoogle` uses Firebase Auth (`signInWithPopup` with [`googleProvider`](../src/config/firebase.ts)), syncs user info with Firestore, updates last login time, and updates state.

---

## 2. Current Issues

### A. General Issues

- **Inconsistent error handling:** Some Firebase errors are not mapped to user-friendly messages.
- **User data sync:** Firestore offline or permission errors may result in incomplete user creation or failure to update `lastLoginAt`.
- [x] **Standardize error handling** (Đã hoàn thành ngày 07/03/2025)
  - Map all Firebase error codes to user-friendly, consistent messages.
  - Display clear errors to users.
- **Environment variable dependency:** Missing Firebase environment variables may cause improper initialization.
- **Offline handling:** Fallback logic exists but may cause user data desynchronization.

### B. Email/Password Login

- **Error messages:** Some errors are in English, some in Vietnamese, not consistent.
- [x] **Check internal user status** (Đã hoàn thành ngày 07/03/2025)
  - Block login if user is disabled (`isActive: false`).
- **No email verification check:** Does not check `user.emailVerified` after login.
- **No login attempt limit:** No logic to lock account after too many failed attempts (relies only on Firebase).

### C. Google Login

- [x] **Write test cases for login flows** (Đã hoàn thành ngày 07/03/2025)
  - Đã có unit test cho các trường hợp: thành công, sai mật khẩu, email chưa xác thực, user bị vô hiệu hóa, sai domain Google Workspace, thiếu biến môi trường.
  - Đã có e2e test cho các luồng đăng nhập chính.
- **Google Provider dependency:** Missing scopes or custom parameters may result in incomplete user info.
- **No domain check:** If using Google Workspace, should check email domain.
- **No internal user status check:** Does not block login for users disabled in internal system (`isActive: false`).

---

## 3. Task Breakdown

- [x] **Standardize error handling** (Đã hoàn thành ngày 07/03/2025)

  - Map all Firebase error codes to user-friendly, consistent messages.
  - Display clear errors to users.

- [x] **Sync user data with Firestore** (Đã hoàn thành ngày 07/03/2025)

  - Ensure user is always created/synced with full info on first login.
  - Handle offline and permission errors gracefully.

- [x] **Check email verification (Email/Password)** (Đã hoàn thành ngày 07/03/2025)

  - Add logic to check `user.emailVerified` after login.
  - Notify user if email is not verified.

- [x] **Check Google Workspace domain (Google Login)** (Đã hoàn thành ngày 07/03/2025)

  - If using Google Workspace, validate returned email domain.
  - Reject login if domain is incorrect.

- [x] **Check internal user status** (Đã hoàn thành ngày 07/03/2025)

  - Block login if user is disabled (`isActive: false`).

- [x] **Check environment configuration** (Đã hoàn thành ngày 07/03/2025)

  - Add checks and warnings for missing Firebase environment variables.

- [x] **Write test cases for login flows** (Đã hoàn thành ngày 07/03/2025)
  - Add unit and e2e tests for success/failure scenarios.

---

## 4. Notes

- Review [`src/components/auth/LoginForm.tsx`](../src/components/auth/LoginForm.tsx), [`src/contexts/AuthContext.tsx`](../src/contexts/AuthContext.tsx), and [`src/config/firebase.ts`](../src/config/firebase.ts) for implementation details.
- Ensure all user-facing messages are consistent and localized.
- Consider edge cases for offline and multi-tab scenarios.
