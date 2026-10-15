import { StaticPageView, staticPageMetadata } from '@/components/content/StaticPageView';

export const metadata = staticPageMetadata('correctionPolicy');

export default function CorrectionPolicyPage() {
  return <StaticPageView pageKey="correctionPolicy" />;
}
