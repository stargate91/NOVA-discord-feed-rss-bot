/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['novafeeds.xyz'],
  serverExternalPackages: ['pg', 'json-bigint', 'stripe'],
};

export default nextConfig;
