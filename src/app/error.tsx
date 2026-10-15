'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Beklenmeyen istemci hatası ekranı. Hata konsola yazılır; ileride bir hata
 * izleme servisine (ör. Sentry) bağlanabilir. Bkz. docs/yayinlama-ve-geri-alma.md
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Maden360] Beklenmeyen hata:', error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-copper-700">
          Beklenmeyen hata
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-950">
          Bir şeyler ters gitti
        </h1>
        <p className="mt-4 text-lg leading-8 text-graphite-700">
          Sayfa yüklenirken bir hata oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
          Sorun sürerse bize bildirin.
        </p>
        {error.digest && (
          <p className="mt-2 text-sm text-graphite-500">Hata kodu: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center rounded-md bg-copper-600 px-5 font-semibold text-white hover:bg-copper-700"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-md border border-graphite-300 bg-white px-5 font-semibold text-graphite-800 hover:border-copper-400"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
