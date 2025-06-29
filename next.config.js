/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "images.unsplash.com", "via.placeholder.com"],
    unoptimized: true,
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
