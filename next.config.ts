import type { NextConfig } from 'next';

/**
 * Site tamamen statik olarak üretilir (output: 'export').
 * Çıktı `out/` klasörüne yazılır ve herhangi bir statik barındırma
 * hizmetine (Cloudflare Pages, Netlify, GitHub Pages, Vercel vb.) yüklenebilir.
 *
 * İleride üyelik, yönetim paneli gibi sunucu gerektiren özellikler eklenirse
 * `output: 'export'` satırı kaldırılarak Node.js barındırmaya geçilebilir.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
