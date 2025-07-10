'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    try {
      if (router && typeof router.replace === 'function') {
        router.replace('/error-404');
      }
    } catch {
      // ignore error
    }
  }, [router]);
  return null;
}
