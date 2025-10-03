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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
})

<<<<<<< HEAD
module.exports = withBundleAnalyzer(nextConfig)
=======
let exportedConfig = withBundleAnalyzer(nextConfig)

try {
  const sentry = require("@sentry/nextjs")
  if (sentry && typeof sentry.withSentryConfig === "function") {
    exportedConfig = sentry.withSentryConfig(exportedConfig, {
      org: "thong123",
      project: "cherish",
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  }
} catch (error) {
  console.warn("Sentry config not applied:", error?.message || error)
}

module.exports = exportedConfig
>>>>>>> 7ef95b98a9c0752d40768608d344228214c855dc
