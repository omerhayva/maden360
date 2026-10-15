import { siteConfig } from '@/config/site';

/** Logo işareti: bakır zemin üzerinde dağ profili ve tabaka çizgisi. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className}>
      <rect width="32" height="32" rx="7" fill="#c96a2b" />
      <path
        d="M5 21.5 11.5 13l5 6 4-4.5 6.5 7"
        fill="none"
        stroke="#14171a"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 25.5h22" stroke="#14171a" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  const name = siteConfig.name;
  const match = /^(.*?)(\d+)$/.exec(name);
  return (
    <span className={className}>
      {match ? (
        <>
          {match[1]}
          <span className="text-copper-400">{match[2]}</span>
        </>
      ) : (
        name
      )}
    </span>
  );
}
