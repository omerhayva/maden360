import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: 'tr',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f4',
    theme_color: '#14171a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
