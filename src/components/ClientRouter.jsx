'use client';

import { BrowserRouter } from 'react-router-dom';

export default function ClientRouter({ Component, pageProps }) {
  return (
    <BrowserRouter>
      <Component {...pageProps} />
    </BrowserRouter>
  );
}
