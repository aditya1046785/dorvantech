'use client';

import React, { useEffect, useState } from 'react';
import { Swatch } from '@/components/Swatch';

export function LifecycleSheet() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rows = [
    {
      title: 'Discover',
      desc: 'We learn your business, users and goals.',
    },
    {
      title: 'Plan',
      desc: 'Scope, timeline and cost, laid out before we build.',
    },
    {
      title: 'Build',
      desc: 'You see progress and give feedback as it happens.',
    },
    {
      title: 'Launch',
      desc: 'Testing, deployment and handover.',
    },
  ];

  return (
    <div className="w-full bg-surface border border-mist rounded-lg overflow-hidden flex flex-col shadow-none">
      <div className="h-[52px] px-5 border-b border-mist flex items-center justify-between shrink-0">
        <h3 className="t-h4">A project with DORVANTECH</h3>
        <span className="t-caption">Founder-led</span>
      </div>

      <div className="p-6 relative">
        {/* Solid vertical line - exactly centered through markers */}
        <div
          className="absolute left-[31px] top-[32px] w-[2px] bg-navy origin-top pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
          style={{
            height: '240px',
            transform: mounted ? 'scaleY(1)' : 'scaleY(0)',
          }}
          aria-hidden="true"
        />

        {/* Hatched vertical line continuation */}
        <div
          className={`absolute left-[31px] top-[272px] bottom-[24px] w-[2px] border-l-2 border-dashed border-navy/60 fade-down pointer-events-none transition-opacity duration-700 delay-1000 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4 relative z-10">
          {rows.map((row, idx) => (
            <div
              key={row.title}
              className={`min-h-[64px] grid grid-cols-[32px_1fr] items-start transition-all duration-[420ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{
                transitionDelay: mounted ? `${250 + idx * 110}ms` : '0ms',
              }}
            >
              <div className="pt-1 flex items-center justify-start">
                <span className="w-[16px] h-[16px] rounded-full pat-solid block shrink-0" />
              </div>
              <div>
                <h4 className="t-h4 leading-none">{row.title}</h4>
                <p className="t-small mt-1">{row.desc}</p>
              </div>
            </div>
          ))}

          {/* Live divider */}
          <div
            className={`my-2 flex items-center relative transition-opacity duration-300 delay-900 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-full h-[1.5px] bg-signal" />
            <div className="absolute left-[32px] bg-signal-tint text-signal t-caption font-semibold rounded-full px-3 py-1">
              Your project goes live
            </div>
          </div>

          {/* Manage row */}
          <div
            className="rounded-md border border-mist p-3 sm:px-4 pat-hatch-soft bg-sunken grid grid-cols-[32px_1fr] items-start relative overflow-hidden transition-[clip-path] duration-700 delay-1000"
            style={{
              clipPath: mounted ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
            }}
          >
            <div className="pt-1 flex items-center justify-start">
              <span className="w-[16px] h-[16px] rounded-full pat-outline pat-hatch block shrink-0 bg-surface" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="t-h4 leading-none">Manage</h4>
                <p className="t-small mt-1">
                  Hosting, domains, databases, updates and support, if you choose.
                </p>
              </div>
              <span className="bg-surface border border-navy rounded-full t-caption px-3 py-0.5 shrink-0">
                Optional
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[52px] bg-sunken px-5 border-t border-mist flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <Swatch kind="build" size="sm" />
          <span className="t-caption">We build</span>
        </div>
        <div className="flex items-center gap-2">
          <Swatch kind="managed" size="sm" />
          <span className="t-caption">We manage, if you choose</span>
        </div>
      </div>
    </div>
  );
} 