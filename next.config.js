/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  // API routes configuration
  api: {
    bodyParser: false, // We use formData directly
    responseLimit: false,
  },
}

module.exports = nextConfig

