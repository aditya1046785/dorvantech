import React from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { siteContent } from '@/content/site';

export function Audiences() {
  const { audiences } = siteContent;

  return (
    <section id="audiences" className="sec bg-paper">
      <div className="container">
        <SectionHeading title={audiences.heading} lead={audiences.lead} />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-mist">
          {audiences.items.map((item, idx) => (
            <div
              key={item.title}
              className={`py-10 md:py-0 flex flex-col ${
                idx === 0 ? 'md:pr-8' : idx === 2 ? 'md:pl-8' : 'md:px-8'
              }`}
            >
              <h3 className="t-h3">{item.title}</h3>
              <p className="t-body mt-3">{item.description}</p>

              <h4 className="t-h4 font-semibold mt-6">Common needs</h4>
              <div className="flex flex-col gap-1.5 mt-2">
                {item.needs.map((need) => (
                  <span key={need} className="t-small text-slate">
                    {need}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}