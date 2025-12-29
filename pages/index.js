"use client";

import React from 'react';
import Head from 'next/head';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Netolyte | Lead Management</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="min-h-screen bg-slate-950">
        <Dashboard />
      </main>
    </>
  );
}
