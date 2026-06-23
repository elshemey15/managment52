
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // تفعيل التصدير الثابت للنشر المجاني على أي استضافة
  output: 'export',
  images: {
    unoptimized: true, // ضروري جداً عند التصدير الثابت
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // لضمان عمل المسارات بشكل صحيح في الاستضافات الثابتة
  trailingSlash: true,
};

export default nextConfig;
