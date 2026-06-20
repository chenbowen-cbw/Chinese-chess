/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the shared TypeScript workspace packages from source.
  transpilePackages: ['@xiangqi/engine', '@xiangqi/ai'],
};

export default nextConfig;
