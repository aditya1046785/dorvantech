import React from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { ServicesAccordion } from '@/components/ServicesAccordion';
import { siteContent } from '@/content/site';

export function Services() {
  const { services } = siteContent;

  return (
    <section id="services" className="sec bg-paper">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-[108px] lg:self-start">
            <SectionHeading title={services.heading} lead={services.lead} />
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ServicesAccordion />
          </div>
        </div>
      </div>
    </section>
  );
}