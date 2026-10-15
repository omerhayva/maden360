import { StaticPageView, staticPageMetadata } from '@/components/content/StaticPageView';

export const metadata = staticPageMetadata('sourcePolicy');

export default function SourcePolicyPage() {
  return <StaticPageView pageKey="sourcePolicy" />;
}
