import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Check if key exists to prevent crashing if env is missing
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
