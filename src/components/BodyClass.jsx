'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BodyClass() {
  const pathname = usePathname();
  useEffect(() => {
    const isLogin = pathname === '/' || (pathname && pathname.startsWith('/forgettenpassword'));
    document.body.className = isLogin ? 'login-body' : 'dashboard-body';
  }, [pathname]);
  return null;
}
