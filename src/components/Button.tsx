import React, { type ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

type BaseProps = {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof BaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center h-[52px] px-[28px] rounded-full font-display font-semibold text-[16px] transition-colors duration-200 select-none min-h-[44px] min-w-[44px]';

  const variantClasses =
    variant === 'primary'
      ? 'bg-navy text-white hover:bg-signal active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-navy'
      : 'bg-surface text-navy border-[1.5px] border-navy hover:bg-sunken active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface';

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={combinedClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { disabled, type = 'button', ...buttonProps } = props as ButtonAsButton;
  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClasses}
      {...buttonProps}
    >
      {children}
    </button>
  );
}   