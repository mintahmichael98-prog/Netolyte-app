"use client";

import React, { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'; 

export default function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  // Prevents "Hydration Mismatch" errors in React 19/Next 15
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // A simple dark background to show while the app loads
    return <div style={{ background: '#020617', minHeight: '100vh' }} />;
  }

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
