import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { cx, inputClasses, type FieldSize } from './styles';

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'size'> {
  size?: FieldSize;
  invalid?: boolean;
  /** Dış kapsayıcıya (konum, kenar boşluğu) */
  wrapperClassName?: string;
}

/**
 * Yerel <select> öğesi, sitedeki diğer alanlarla aynı görünümde. Tarayıcının küçük okunun yerine
 * ortak ok simgesi kullanılır; yüksek kontrast modunda tarayıcının kendi görünümüne dönülür.
 */
export function Select({
  size = 'lg',
  invalid = false,
  wrapperClassName,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <div className={cx('relative', wrapperClassName)}>
      <select
        {...rest}
        className={inputClasses({
          size,
          invalid,
          className: cx(
            'cursor-pointer appearance-none py-2 pl-3 pr-10 forced-colors:appearance-auto forced-colors:pr-3',
            className,
          ),
        })}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-graphite-500 forced-colors:hidden"
      />
    </div>
  );
}
