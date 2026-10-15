'use client';

import { useEffect } from 'react';

/** Kök yerleşimin kendisi hata verirse gösterilen yedek ekran. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Maden360] Kritik hata:', error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '3rem 1.5rem',
          color: '#14171a',
          background: '#f5f5f4',
        }}
      >
        <h1 style={{ fontSize: '1.75rem' }}>Bir şeyler ters gitti</h1>
        <p>Sayfa yüklenemedi. Lütfen tekrar deneyin.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.25rem',
            background: '#a9541f',
            color: 'white',
            border: 0,
            borderRadius: 6,
          }}
        >
          Tekrar dene
        </button>
      </body>
    </html>
  );
}
