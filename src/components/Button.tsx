import React, { type ComponentPropsWithoutRef } from "react";
import Link from "next/link";

type BaseProps = {
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const combinedClasses = `action ${variant === "primary" ? "action-primary" : "action-secondary"} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={combinedClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { disabled, type = "button", ...buttonProps } = props as ButtonAsButton;
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
