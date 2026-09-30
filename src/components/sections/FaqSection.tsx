import React from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { Faq } from '@/components/Faq';
import { siteContent } from '@/content/site';

export function FaqSection() {
  const { faq } = siteContent;

  return (
    <section id="faq" className="sec bg-paper">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <SectionHeading title={faq.heading} />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Faq />
          </div>
        </div>
      </div>
    </section>
  );
}   