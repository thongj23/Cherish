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
    domains: [
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "via.placeholder.com",
      "res.cloudinary.com",
    ],
    unoptimized: false,
  },
  experimental: {
    optimizeCss: true,
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true, 
})

module.exports = withBundleAnalyzer(nextConfig)
