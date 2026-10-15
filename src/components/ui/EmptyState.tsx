import type { ReactNode } from 'react';

export function EmptyState({
  title,
  children,
  icon,
}: {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-graphite-300 bg-white px-6 py-10 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-graphite-900">{title}</p>
      {children && (
        <div className="mx-auto mt-2 max-w-xl text-sm leading-6 text-graphite-600">{children}</div>
      )}
    </div>
  );
}
