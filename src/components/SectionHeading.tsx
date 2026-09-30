import React from 'react';

interface SectionHeadingProps {
  title: string;
  lead?: string;
  className?: string;
}

export function SectionHeading({
  title,
  lead,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className="t-h2">{title}</h2>
      {lead ? <p className="t-lead mt-5">{lead}</p> : null}
    </div>
  );
}