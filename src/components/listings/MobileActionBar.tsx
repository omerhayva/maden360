import { ArrowDown, type LucideIcon } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Mobilde ilan sayfasının altında sabit duran eylem çubuğu. Uzun sayfalarda iletişim/başvuru
 * kutusu en altta kaldığı için tek dokunuşla o kutuya iner (aynı sayfadaki bağlantı; JavaScript
 * gerekmez). Geniş ekranda kutu yan sütunda göründüğünden çubuk gizlenir.
 *
 * - Sayfa sonu ve klavyeyle odaklanan öğeler çubuğun altında kalmaz (globals.css → mobile-action-bar).
 * - Süresi dolan ilanda iletişim kutularıyla birlikte gizlenir (ilan-iletisim sınıfı).
 * - Sayfanın en sonuna yerleştirilir: ekran okuyucu okuma sırası içerikten sonra gelir.
 */
export function MobileActionBar({
  href,
  label,
  icon,
}: {
  /** Aynı sayfadaki kutunun başlık kimliği, ör. "#basvuru" */
  href: `#${string}`;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mobile-action-bar ilan-iletisim no-print fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(20_23_26/0.08)] lg:hidden">
      <ButtonLink href={href} size="lg" width="full" icon={icon} iconEnd={ArrowDown}>
        {label}
      </ButtonLink>
    </div>
  );
}
