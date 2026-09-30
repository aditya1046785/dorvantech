import React from 'react';
import { Swatch } from '@/components/Swatch';
import { ResponsibilityLine } from '@/components/ResponsibilityLine';
import { siteContent } from '@/content/site';

export function Partnership() {
  const { partnership } = siteContent;

  return (
    <section id="partnership" className="sec sec-surface">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="t-h2">{partnership.heading}</h2>
            <p className="t-lead mt-5">{partnership.lead}</p>
          </div>
        </div>

        {/* Dynamic Responsibility Diagram */}
        <ResponsibilityLine />

        {/* Engagement Legend Columns */}
        <div className="mt-[88px] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-mist">
          {partnership.engagements.map((item, idx) => (
            <div
              key={item.title}
              className={`py-8 md:py-0 ${
                idx === 0 ? 'md:pr-8' : idx === 2 ? 'md:pl-8' : 'md:px-8'
              }`}
            >
              <div className="mb-5">
                <Swatch kind={item.type} size="lg" />
              </div>
              <h3 className="t-h3">{item.title}</h3>
              <p className="t-body mt-3 max-w-[34ch]">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Plain-terms Note Strip */}
        <div className="mt-12 bg-sunken rounded-md p-5 md:px-6 border-l-[3px] border-signal">
          <p className="t-body text-slate">{partnership.noteStrip}</p>
        </div>
      </div>
    </section>
  );
}