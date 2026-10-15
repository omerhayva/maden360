import type { ReactNode } from 'react';
import type { ContentStatus } from '@/lib/content/schemas';
import { statusLabels } from '@/lib/content/visibility';

const tones = {
  neutral: 'bg-stone-100 text-graphite-700 ring-stone-300',
  copper: 'bg-copper-50 text-copper-800 ring-copper-200',
  amber: 'bg-amber-50 text-amber-900 ring-amber-300',
  green: 'bg-emerald-50 text-emerald-900 ring-emerald-300',
  slate: 'bg-graphite-100 text-graphite-800 ring-graphite-300',
  dark: 'bg-graphite-800 text-graphite-100 ring-graphite-700',
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const statusTone: Record<ContentStatus, BadgeTone> = {
  draft: 'slate',
  review: 'amber',
  published: 'green',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabels[status]}</Badge>;
}
