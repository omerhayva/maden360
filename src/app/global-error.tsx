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
          color: '#0c111a',
          background: '#f3f5f7',
        }}
      >
        <h1 style={{ fontSize: '1.75rem' }}>Bir şeyler ters gitti</h1>
        <p>Sayfa yüklenemedi. Lütfen tekrar deneyin.</p>
        {/* Site stilleri yüklenemeyebilir; düğme görünümü (styles.ts → primary) satır içi verilir */}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '1rem',
            minHeight: 48,
            padding: '0.625rem 1.25rem',
            background: '#933d08',
            color: 'white',
            font: 'inherit',
            fontWeight: 600,
            border: '1px solid transparent',
            borderRadius: 6,
            boxShadow: '0 2px 0 0 #5d270d',
            cursor: 'pointer',
          }}
        >
          Tekrar dene
        </button>
      </body>
    </html>
  );
}
