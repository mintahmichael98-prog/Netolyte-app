"use client";

import React, { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'; 

export default function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ background: '#020617', minHeight: '100vh' }} />;
  }

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
