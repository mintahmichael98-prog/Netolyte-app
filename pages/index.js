import dynamic from 'next/dynamic';

// This tells Next.js to load the App component ONLY on the client side
const AppWithNoSSR = dynamic(() => import('../App'), {
  ssr: false,
});

export default function Home() {
  return <AppWithNoSSR />;
}
