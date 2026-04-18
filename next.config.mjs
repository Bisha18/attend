/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase API body size limit to allow selfie base64 uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
