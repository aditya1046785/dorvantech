import React from 'react';
import { RequirementsSheet } from '@/components/RequirementsSheet';
import { siteContent } from '@/content/site';

export function Principles() {
  const { principles } = siteContent;

  return (
    <section id="principles" className="sec sec-surface">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col">
            <h2 className="t-h2">{principles.heading}</h2>
            <p className="t-lead mt-5">{principles.lead}</p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-10">
              {principles.items.map((principle) => (
                <div
                  key={principle.title}
                  className="border-l-[3px] border-signal pl-5 flex flex-col"
                >
                  <h3 className="t-h3">{principle.title}</h3>
                  <p className="t-body mt-2">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Requirements Spec Sheet */}
          <div className="lg:col-span-5 lg:col-start-8 lg:sticky lg:top-[108px]">
            <RequirementsSheet />
          </div>
        </div>
      </div>
    </section>
  );
}