import { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  // Only render the app once it's mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a basic loading state or null to prevent hydration crash
    return <div style={{ background: '#0f172a', height: '100vh' }} />;
  }

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
