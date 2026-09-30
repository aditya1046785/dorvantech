'use client';

import React, { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { Swatch } from '@/components/Swatch';
import { siteContent } from '@/content/site';

export function ResponsibilityLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { threshold: 0.4, once: true });
  const { partnership } = siteContent;

  return (
    <div ref={containerRef} className="w-full mt-[72px]">
      {/* Desktop view (>= lg) */}
      <div className="hidden lg:block w-full">
        <div className="flex justify-between items-center mb-3">
          <h4 className="t-h4">Built with you</h4>
          <h4 className="t-h4 text-right">Managed by DORVANTECH, if you choose</h4>
        </div>

        <div className="relative w-full h-[64px] flex items-center">
          <div
            className="h-full w-[56%] pat-solid rounded-l-[12px] flex items-center origin-left transition-transform duration-900 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
              transform: isInView ? 'scaleX(1)' : 'scaleX(0)',
            }}
          >
            <div className="grid grid-cols-4 w-full h-full divide-x divide-white/25">
              {['Understand', 'Plan', 'Develop', 'Test and deploy'].map((label) => (
                <div
                  key={label}
                  className={`flex items-center justify-center font-display font-semibold text-[15px] text-white px-2 text-center transition-opacity duration-300 delay-500 ${
                    isInView ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`absolute left-[56%] -top-6 -bottom-6 w-[2px] bg-signal z-20 transition-transform duration-300 delay-900 origin-center ${
              isInView ? 'scale-y-100' : 'scale-y-0'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal-tint text-signal t-caption font-semibold px-3 py-1 rounded-full whitespace-nowrap">
              Launch
            </div>
          </div>

          <div
            className="h-full w-[44%] pat-hatch border-y-[1.5px] border-navy rounded-r-[12px] fade-right transition-[clip-path] duration-700 delay-900"
            style={{
              clipPath: isInView ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-12 gap-6">
          <div
            className={`col-span-6 transition-opacity duration-500 delay-1000 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="t-small max-w-[34ch]">{partnership.builtNote}</p>
          </div>
          <div
            className={`col-span-6 transition-opacity duration-500 delay-1000 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="grid grid-cols-3 gap-y-3 gap-x-4">
              {partnership.managedItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Swatch kind="managed" size="sm" />
                  <span className="t-small">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet view (< lg) */}
      <div className="block lg:hidden flex flex-col gap-6">
        <div>
          <h4 className="t-h4 mb-3">Built with you</h4>
          <div className="pat-solid rounded-md p-5 flex flex-col gap-4">
            {['Understand', 'Plan', 'Develop', 'Test and deploy'].map((stage) => (
              <div key={stage} className="font-display font-semibold text-[15px] text-white">
                {stage}
              </div>
            ))}
          </div>
        </div>

        <div className="relative py-2 flex items-center">
          <div className="w-full h-[2px] bg-signal" />
          <div className="absolute left-4 bg-signal-tint text-signal t-caption font-semibold px-3 py-1 rounded-full">
            Launch
          </div>
        </div>

        <div>
          <h4 className="t-h4 mb-3">Managed by DORVANTECH, if you choose</h4>
          <div className="pat-hatch border-[1.5px] border-navy rounded-md p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-surface/85 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-2.5">
              {partnership.managedItems.map((item) => (
                <div key={item} className="bg-surface rounded-md px-3 py-2 border border-mist flex items-center gap-2">
                  <Swatch kind="managed" size="sm" />
                  <span className="t-small">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="t-small">{partnership.builtNote}</p>
      </div>
    </div>
  );
}