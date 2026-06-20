/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the shared TypeScript engine package from source.
  transpilePackages: ['@xiangqi/engine'],
};

export default nextConfig;
