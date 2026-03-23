'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BodyClass() {
  const pathname = usePathname();
  useEffect(() => {
    const isLogin = 
      pathname === '/' || 
      (pathname && (
        pathname.startsWith('/forgettenpassword') || 
        pathname.startsWith('/register') || 
        pathname.startsWith('/verify-otp')
      ));
    if (isLogin) {
      document.body.classList.add('login-body');
      document.body.classList.remove('dashboard-body');
    } else {
      document.body.classList.add('dashboard-body');
      document.body.classList.remove('login-body');
    }
  }, [pathname]);
  return null;
}
