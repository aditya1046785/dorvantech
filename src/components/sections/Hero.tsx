import React from 'react';
import { Button } from '@/components/Button';
import { LifecycleSheet } from '@/components/LifecycleSheet';
import { siteContent } from '@/content/site';

export function Hero() {
  const { hero } = siteContent;

  return (
    <section
      id="hero"
      className="sec bg-paper pt-10 sm:pt-16 pb-16 lg:pb-24 lg:min-h-[calc(100svh-68px)] lg:max-h-[860px] flex flex-col justify-between"
    >
      <div className="container w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <h1 className="t-display">{hero.title}</h1>
            <p className="t-lead mt-7">{hero.lead}</p>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button variant="primary" href="/#contact" className="w-full sm:w-auto">
                Discuss your project
              </Button>
              <Button variant="secondary" href="/#work" className="w-full sm:w-auto">
                Explore our work
              </Button>
            </div>

            <p className="t-caption mt-5">{hero.microLine}</p>
          </div>

          {/* Right Column: Visual Sheet */}
          <div className="lg:col-span-5 w-full max-w-[520px] lg:max-w-[480px] lg:ml-auto lg:mt-2">
            <LifecycleSheet />
          </div>
        </div>

        {/* Pillars Row */}
        <div className="mt-16 lg:mt-[88px] grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {hero.pillars.map((pillar) => (
            <div key={pillar.title} className="border-t border-mist pt-5 flex flex-col">
              <h4 className="t-h4">{pillar.title}</h4>
              <p className="t-small text-slate mt-1">{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}