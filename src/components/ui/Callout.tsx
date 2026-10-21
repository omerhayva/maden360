import { CircleAlert, Info, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

const variants = {
  info: {
    icon: Info,
    className: 'border-sky-200 bg-sky-50 text-sky-950',
    iconClass: 'text-sky-700',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-300 bg-amber-50 text-amber-950',
    iconClass: 'text-amber-700',
  },
  danger: {
    icon: CircleAlert,
    className: 'border-red-200 bg-red-50 text-red-950',
    iconClass: 'text-red-700',
  },
  safety: {
    icon: ShieldCheck,
    className: 'border-stone-300 bg-white text-graphite-800',
    iconClass: 'text-copper-700',
  },
} as const;

interface CalloutProps {
  variant?: keyof typeof variants;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({ variant = 'info', title, children, className = '' }: CalloutProps) {
  const { icon: Icon, className: tone, iconClass } = variants[variant];
  return (
    <div className={`flex gap-3 rounded-sm border p-4 ${tone} ${className}`}>
      <Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 text-sm leading-6">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  );
}
