import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async redirects() {
    // When deployed as the standalone nirvana-demo project, redirect root to the demo page
    if (process.env.VERCEL_PROJECT_NAME === 'nirvana-demo') {
      return [{ source: '/', destination: '/nirvana', permanent: false }]
    }
    return []
  },
}

export default nextConfig
