/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This helps if you have issues with modules in the pages directory
  transpilePackages: ['lucide-react'] 
};

module.exports = nextConfig;
