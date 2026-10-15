import { StaticPageView, staticPageMetadata } from '@/components/content/StaticPageView';

export const metadata = staticPageMetadata('contact');

export default function ContactPage() {
  return <StaticPageView pageKey="contact" />;
}
