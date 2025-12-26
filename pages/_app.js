import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'; // Remove this line if you don't have a CSS file yet

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
