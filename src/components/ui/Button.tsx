import Link from 'next/link';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { isInternalHref } from '@/lib/href';
import {
  buttonClasses,
  cx,
  iconButtonClasses,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from './styles';

/**
 * Düğme bileşenleri. Kural: bir eylem gerçekleştiren öğe <Button>, başka bir sayfaya veya
 * adrese götüren öğe <ButtonLink> olur (görünüm aynı, anlam farklı). Ayrıntılar ve örnekler:
 * docs/arayuz-rehberi.md
 *
 * Bu dosya 'use client' içermez: sunucu bileşenleri bağlantı ve gönder düğmesi olarak,
 * tarayıcı bileşenleri olay işleyicileriyle kullanabilir.
 */

interface ButtonLookProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  /** Metnin önündeki simge */
  icon?: LucideIcon;
  /** Metnin ardındaki simge (ok, dış bağlantı vb.) */
  iconEnd?: LucideIcon;
  children: ReactNode;
}

function ButtonContent({
  icon: Icon,
  iconEnd: IconEnd,
  loading = false,
  children,
}: Pick<ButtonLookProps, 'icon' | 'iconEnd' | 'children'> & { loading?: boolean }) {
  return (
    <>
      {loading ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : (
        Icon && <Icon aria-hidden="true" />
      )}
      {children}
      {IconEnd && <IconEnd aria-hidden="true" />}
    </>
  );
}

export interface ButtonProps
  extends ButtonLookProps, Omit<ComponentPropsWithRef<'button'>, 'children'> {
  /**
   * Yükleniyor durumu (ör. form gönderilirken). Düğme odakta kalır (`aria-disabled`, `disabled`
   * değil), tıklama ve Enter ile yeniden gönderim yok sayılır, durum ekran okuyucuya duyurulur.
   * Bu özelliği kullanan düğmenin yanına bir canlı bölge eklenir; kullanmayanlarda eklenmez.
   */
  loading?: boolean;
  /** Yükleniyor durumunda ekran okuyucuya duyurulacak metin */
  loadingLabel?: string;
}

export function Button({
  variant,
  size,
  width,
  icon,
  iconEnd,
  loading,
  loadingLabel = 'İşleminiz sürüyor, lütfen bekleyin',
  className,
  type = 'button',
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <>
      <button
        type={type}
        {...rest}
        aria-disabled={loading ? true : rest['aria-disabled']}
        data-loading={loading ? '' : undefined}
        onClick={loading ? (event) => event.preventDefault() : onClick}
        className={buttonClasses({ variant, size, width, className })}
      >
        <ButtonContent icon={icon} iconEnd={iconEnd} loading={loading}>
          {children}
        </ButtonContent>
      </button>
      {loading !== undefined && (
        <span role="status" className="sr-only">
          {loading ? loadingLabel : ''}
        </span>
      )}
    </>
  );
}

export interface ButtonLinkProps
  extends ButtonLookProps, Omit<ComponentPropsWithRef<'a'>, 'children' | 'href'> {
  href: string;
}

/** Düğme görünümlü bağlantı */
export function ButtonLink({
  href,
  variant,
  size,
  width,
  icon,
  iconEnd,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, width, className });
  const content = (
    <ButtonContent icon={icon} iconEnd={iconEnd}>
      {children}
    </ButtonContent>
  );
  return isInternalHref(href) ? (
    <Link href={href} {...rest} className={classes}>
      {content}
    </Link>
  ) : (
    <a href={href} {...rest} className={classes}>
      {content}
    </a>
  );
}

interface IconOnlyProps {
  /** Erişilebilir ad (ekran okuyucu bu metni okur); zorunludur */
  label: string;
  icon: LucideIcon;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export interface IconButtonProps
  extends IconOnlyProps, Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {}

/** Yalnızca simgeden oluşan düğme (menü, temizle). Fareyle üzerine gelince ad ipucu olarak görünür. */
export function IconButton({
  label,
  icon: Icon,
  variant,
  size,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      {...rest}
      className={iconButtonClasses({ variant, size, className })}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}

export interface IconLinkProps
  extends IconOnlyProps, Omit<ComponentPropsWithRef<'a'>, 'children' | 'aria-label' | 'href'> {
  href: string;
}

/** Yalnızca simgeden oluşan bağlantı (ör. mobilde arama sayfasına git) */
export function IconLink({
  href,
  label,
  icon: Icon,
  variant,
  size,
  className,
  ...rest
}: IconLinkProps) {
  const classes = iconButtonClasses({ variant, size, className });
  const icon = <Icon aria-hidden="true" />;
  return isInternalHref(href) ? (
    <Link href={href} aria-label={label} title={label} {...rest} className={classes}>
      {icon}
    </Link>
  ) : (
    <a href={href} aria-label={label} title={label} {...rest} className={classes}>
      {icon}
    </a>
  );
}

/**
 * Yan yana düğmeler: mobilde alt alta ve tam genişlikte, geniş ekranda yan yana dizilir.
 * Gruptaki metin bağlantıları düğmelerle aynı hizaya oturur.
 */
export function ButtonGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      {children}
    </div>
  );
}
