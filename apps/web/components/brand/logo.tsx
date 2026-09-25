import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  /** Size of the logo mark in pixels. */
  size?: number;
  /** Show the "Adyapan Connect" wordmark next to the mark. */
  showText?: boolean;
  /** Color of the wordmark text. */
  textClassName?: string;
  /** Wrap in a link to the given href. Pass null to render without a link. */
  href?: string | null;
  className?: string;
  onClick?: () => void;
};

/**
 * Brand logo used across the whole site (navbar, footer, sidebar, auth pages).
 * The image lives at /public/logo.svg — replace that file to change the logo everywhere.
 */
export function Logo({
  size = 32,
  showText = true,
  textClassName = 'text-gray-900',
  href = '/',
  className,
  onClick,
}: LogoProps) {
  const inner = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* Plain img keeps this simple and avoids next/image constraints for the logo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpg"
        alt="Adyapan Connect logo"
        width={size}
        height={size}
        className="rounded-full object-contain"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className={cn('font-bold leading-tight', textClassName)}>
          Adyapan <span className="text-green-500">Connect</span>
        </span>
      )}
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} onClick={onClick} className="inline-flex items-center">
      {inner}
    </Link>
  );
}
