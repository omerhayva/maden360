import { StaticPageView, staticPageMetadata } from '@/components/content/StaticPageView';

export const metadata = staticPageMetadata('about');

export default function AboutPage() {
  return <StaticPageView pageKey="about" />;
}
