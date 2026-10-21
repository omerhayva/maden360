'use client';

import { CalendarClock, CircleAlert } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { formatDate } from '@/lib/format';
import { daysLeft, todayInTurkey } from '@/lib/listings/dates';

const noSubscription = () => () => {};

/** Tarayıcıdaki bugünün tarihi; sunucuda (statik derlemede) null. */
function useClientToday(): string | null {
  return useSyncExternalStore(noSubscription, todayInTurkey, () => null);
}

/**
 * İlanın bitiş tarihini gösterir. Statik sayfa bir sonraki derlemeye kadar
 * yayında kalabileceği için süre, ziyaretçinin tarayıcısında yeniden denetlenir:
 * süresi dolan ilanda uyarı gösterilir ve iletişim kutuları gizlenir
 * (data-ilan-suresi-doldu özniteliği → globals.css).
 */
export function ExpiryNotice({
  expiresAt,
  label = 'Yayın bitişi',
}: {
  expiresAt?: string;
  label?: string;
}) {
  const today = useClientToday();
  const remaining = expiresAt && today ? daysLeft(expiresAt, today) : null;

  useEffect(() => {
    if (remaining === null || remaining >= 0) return;
    document.documentElement.dataset.ilanSuresiDoldu = 'true';
    return () => {
      delete document.documentElement.dataset.ilanSuresiDoldu;
    };
  }, [remaining]);

  if (!expiresAt) return null;

  if (remaining !== null && remaining < 0) {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-sm border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900"
      >
        <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        Bu ilanın süresi {formatDate(expiresAt)} tarihinde doldu; ilan kısa süre içinde
        kaldırılacak.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2 text-sm text-graphite-700">
      <CalendarClock aria-hidden="true" className="h-4 w-4 text-graphite-500" />
      <span>
        {label}:{' '}
        <strong className="font-semibold text-graphite-900">{formatDate(expiresAt)}</strong>
        {remaining !== null && remaining <= 7 && (
          <span className="ml-1 text-amber-800">
            ({remaining === 0 ? 'bugün sona eriyor' : `${remaining} gün kaldı`})
          </span>
        )}
      </span>
    </p>
  );
}
