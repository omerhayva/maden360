import 'server-only';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import { getHalls, getMarketCategories, getPositions } from '@/lib/content';
import type { DeliveryConfig } from './deliver';
import type { FormRegistries } from './forms';

/** Form seçenekleri kayıt dosyalarından üretilir (meslekler, salonlar, market kategorileri). */
export function formRegistries(): FormRegistries {
  return {
    positions: getPositions().map((position) => ({ value: position.slug, label: position.name })),
    halls: getHalls().map((hall) => ({
      value: hall.slug,
      label: `Salon ${hall.code}: ${hall.name}`,
    })),
    marketCategories: getMarketCategories().map((category) => ({
      value: category.slug,
      label: category.name,
      kind: category.kind,
    })),
    rulesHref: routes.listingRules(),
    privacyHref: routes.privacy(),
  };
}

export function marketKindMap(): Record<string, string> {
  return Object.fromEntries(
    getMarketCategories().map((category) => [category.slug, category.kind]),
  );
}

export function deliveryConfig(): DeliveryConfig {
  return {
    email: siteConfig.listingsEmail,
    endpoint: siteConfig.formEndpoint || undefined,
    accessKey: siteConfig.formAccessKey || undefined,
  };
}
