import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'; // Make sure this path exists!

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
