/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds, not in development
  ...(process.env.NEXT_PUBLIC_BUILD_MODE === 'static' && { output: 'export' }),
  basePath: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_BUILD_MODE === 'static' ? '/MSE108SeniorProject' : '',
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_BUILD_MODE === 'static' ? '/MSE108SeniorProject/' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
