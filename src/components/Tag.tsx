import React from 'react';

export type TagKind = 'build' | 'managed' | 'plan' | 'planned';

interface TagProps {
  kind: TagKind;
  className?: string;
}

export function Tag({ kind, className = '' }: TagProps) {
  const baseClasses =
    'inline-flex items-center justify-center h-[28px] rounded-full px-[12px] font-display font-semibold text-[13px] leading-none select-none';

  if (kind === 'build') {
    return (
      <span className={`${baseClasses} pat-solid ${className}`}>
        Build
      </span>
    );
  }

  if (kind === 'managed') {
    return (
      <span
        className={`inline-flex items-center justify-center h-[28px] rounded-full p-[1.5px] pat-hatch border-[1.5px] border-navy ${className}`}
      >
        <span className="bg-surface px-2 rounded-full font-display font-semibold text-[13px] text-navy leading-none h-[22px] inline-flex items-center">
          Managed
        </span>
      </span>
    );
  }

  if (kind === 'plan') {
    return (
      <span className={`${baseClasses} pat-outline text-navy ${className}`}>
        Maintenance plan
      </span>
    );
  }

  if (kind === 'planned') {
    return (
      <span
        className={`${baseClasses} border-[1.5px] border-dashed border-navy bg-transparent text-navy ${className}`}
      >
        Planned
      </span>
    );
  }

  return null;
}