
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // تفعيل التصدير الثابت للنشر المجاني
  output: 'export',
  images: {
    unoptimized: true, // ضروري عند التصدير الثابت
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
