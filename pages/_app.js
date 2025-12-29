"use client"; // Required for Next.js 15 + Clerk hooks

import { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'; // Ensure this path is correct

function MyApp({ Component, pageProps }) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevention: Only render the app once it's fully mounted on the client
  // This solves the "Hydration Mismatch" errors seen in your console.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Show a blank background that matches your theme while loading
    return <div style={{ background: '#0f172a', height: '100vh' }} />;
  }

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
