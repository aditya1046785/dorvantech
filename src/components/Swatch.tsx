import React from 'react';

export type SwatchKind = 'build' | 'managed' | 'plan';
export type SwatchSize = 'sm' | 'lg';

interface SwatchProps {
  kind: SwatchKind;
  size?: SwatchSize;
  className?: string;
}

export function Swatch({ kind, size = 'sm', className = '' }: SwatchProps) {
  const sizeClasses =
    size === 'sm' ? 'w-[14px] h-[14px] rounded-full' : 'w-[64px] h-[40px] rounded-md';

  let fillClasses = '';
  if (kind === 'build') {
    fillClasses = 'pat-solid';
  } else if (kind === 'managed') {
    fillClasses = 'pat-hatch border-[1.5px] border-navy bg-surface';
  } else if (kind === 'plan') {
    fillClasses = 'pat-outline';
  }

  return (
    <span
      className={`inline-block shrink-0 ${sizeClasses} ${fillClasses} ${className}`}
      aria-hidden="true"
    />
  );
}