import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { ContentStatus } from '@/lib/content/schemas';
import { listingStatusLabels } from '@/lib/content/visibility';
import type { MarketType } from '@/lib/listings/options';
import { marketTypeLabels } from '@/lib/listings/options';

const statusTone: Record<ContentStatus, BadgeTone> = {
  draft: 'slate',
  review: 'amber',
  published: 'green',
};

/** Yalnızca önizlemede görülen yayın durumu (yayımlanmış ilanlarda gösterilmez) */
export function ListingStatusBadge({ status }: { status: ContentStatus }) {
  if (status === 'published') return null;
  return <Badge tone={statusTone[status]}>{listingStatusLabels[status]}</Badge>;
}

export function ExampleBadge({ example }: { example?: boolean }) {
  if (!example) return null;
  return <Badge tone="slate">Örnek içerik</Badge>;
}

const typeTone: Record<MarketType, BadgeTone> = {
  satilik: 'copper',
  kiralik: 'neutral',
  aranan: 'amber',
  hizmet: 'dark',
};

export function MarketTypeBadge({ type }: { type: MarketType }) {
  return <Badge tone={typeTone[type]}>{marketTypeLabels[type]}</Badge>;
}

export function VerifiedBadge({ checkedAt }: { checkedAt?: string }) {
  if (!checkedAt) return null;
  return <Badge tone="green">Bilgiler doğrulandı</Badge>;
}

export function FeaturedBadge({ featured }: { featured?: boolean }) {
  if (!featured) return null;
  return <Badge tone="copper">Öne çıkan</Badge>;
}
