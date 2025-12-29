"use client";

import React from 'react';
// We go up one level (..) to leave the 'pages' folder and enter 'components'
import Dashboard from '../components/Dashboard'; 

export default function Home() {
  return (
    <main>
      {/* Your Dashboard component likely already contains 
          the Sidebar, LeadTable, and Stats. 
      */}
      <Dashboard />
    </main>
  );
}
