import React from 'react';
// Import any components you need from your components folder here
// import Header from '../components/Header'; 

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Netolyte</h1>
      <p>Your Next.js 15 application is now running correctly.</p>
      
      {/* If you had logic in App.js that you need here, 
         you can paste the JSX for your main dashboard/home UI below.
      */}
      
      <div className="card">
        <p>Edit <code>pages/index.js</code> to get started.</p>
      </div>
    </main>
  );
}
