# Test Failure Summary

## Section: src/app/

- **Failed Test Suites:** 5 of 14
- **Notable Failures:**
  - [`src/app/auth/signup/page.test.tsx`](src/app/auth/signup/page.test.tsx): Unable to find element with text "Lỗi đăng ký".
  - [`src/app/__tests__/routing-navigation.test.tsx`](src/app/__tests__/routing-navigation.test.tsx): React state updates not wrapped in `act(...)`.
- **Common Errors:**
  - Deprecated `ReactDOMTestUtils.act` usage.
  - Missing `act(...)` wrappers for React state updates.

---

## Section: src/components/common/

- **Failed Test Suites:** 1 of 7
- **Notable Failures:**
  - [`src/components/common/__tests__/integration-visibility.test.tsx`](src/components/common/__tests__/integration-visibility.test.tsx): Cannot spy on the `mock` property because it is not a function; object given instead.
- **Common Errors:**
  - Deprecated `ReactDOMTestUtils.act` usage.
  - Missing `act(...)` wrappers for React state updates.

---

## Section: src/components/providers/

- **Failed Test Suites:** 0 of 2
- **Notable Issues:**

---

## Section: src/components/reports/

- **Failed Test Suites:** 1 of 3
- **Notable Failures:**
  - [`src/components/reports/__tests__/integration-reports.test.tsx`](src/components/reports/__tests__/integration-reports.test.tsx): FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory. Jest worker process terminated (SIGTERM).
- **Common Errors:**

---

## Section: src/contexts/

- **Failed Test Suites:** 1 of 2
- **Notable Failures:**
  - [`src/contexts/__tests__/AuthContext.integration.test.tsx`](src/contexts/__tests__/AuthContext.integration.test.tsx): Cannot read properties of undefined (reading 'user'); assertion failed for expected error message "Email hoặc mật khẩu không đúng".
- **Common Errors:**

---

## Section: src/services/

- **Failed Test Suites:** 0 of 4
- **No notable test failures.**
  - Console errors: Deprecated `ReactDOMTestUtils.act` usage.
  - Missing `act(...)` wrappers for React state updates.
  - Console errors: Deprecated `ReactDOMTestUtils.act` usage.
  - Console errors: Deprecated `ReactDOMTestUtils.act` usage in both test files.
