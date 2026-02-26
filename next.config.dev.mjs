/** @type {import('next').NextConfig} */
const nextConfig = {
  // No 'output: export' - enables API routes
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
