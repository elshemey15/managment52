
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // تفعيل التصدير الثابت لضمان العمل على استضافة مجانية
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // ضروري لعمل الروابط بشكل صحيح في الاستضافة الثابتة
  trailingSlash: true,
  distDir: 'out',
};

export default nextConfig;
