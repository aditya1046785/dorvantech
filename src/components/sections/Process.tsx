import React from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { ProcessList } from '@/components/ProcessList';
import { siteContent } from '@/content/site';

export function Process() {
  const { process } = siteContent;

  return (
    <section id="process" className="sec sec-alt">
      <div className="container">
        <SectionHeading title={process.heading} lead={process.lead} />
        <ProcessList />
      </div>
    </section>
  );
}