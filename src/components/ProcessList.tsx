import React from 'react';
import { Tag } from '@/components/Tag';
import { siteContent, type ProcessItem } from '@/content/site';

export function ProcessList() {
  const { items, dashboardBlock } = siteContent.process;

  return (
    <div className="w-full mt-[72px]">
      <div className="flex flex-col relative">
        {/* Vertical connector line (>= lg) */}
        <div
          className="hidden lg:block absolute left-[56px] top-[72px] bottom-[260px] w-[1.5px] bg-navy pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="hidden lg:block absolute left-[56px] bottom-[160px] h-[100px] w-[1.5px] border-l-[1.5px] border-dashed border-navy/60 pointer-events-none"
          aria-hidden="true"
        />

        {items.map((stage: ProcessItem, idx: number) => {
          const isLast = idx === items.length - 1;

          return (
            <div
              key={stage.number}
              className={`py-8 lg:py-12 border-t border-mist ${
                isLast ? 'border-b' : ''
              } grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10`}
            >
              {/* Numeral */}
              <div className="lg:col-span-2">
                <span
                  className="font-display font-bold text-[56px] lg:text-[96px] leading-none select-none inline-block"
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '1.5px var(--navy)',
                    ...(stage.isHatched
                      ? {
                          backgroundImage:
                            'repeating-linear-gradient(135deg, rgba(10, 25, 48, 0.6) 0 1.5px, transparent 1.5px 8px)',
                          WebkitBackgroundClip: 'text',
                        }
                      : {}),
                  }}
                >
                  {stage.number}
                </span>
              </div>

              {/* Title & Summary */}
              <div className="lg:col-span-5 flex flex-col">
                <h3 className="t-h3">{stage.title}</h3>
                <p className="t-body mt-3">{stage.summary}</p>
              </div>

              {/* Sub-blocks */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="t-h4">{stage.col1Title}</h4>
                  <div className="flex flex-col gap-2 mt-3">
                    {stage.col1Items.map((item) => (
                      <span key={item} className="t-small text-slate">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="t-h4">{stage.col2Title}</h4>
                  <div className="flex flex-col gap-2 mt-3">
                    {stage.col2Items.map((item) => (
                      <span key={item} className="t-small text-slate">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Planned Dashboard Block */}
      <div className="mt-12 rounded-lg border-[1.5px] border-dashed border-navy bg-transparent p-6 md:p-8">
        <Tag kind="planned" />
        <h3 className="t-h3 mt-4">{dashboardBlock.title}</h3>
        <p className="t-body mt-2">{dashboardBlock.body}</p>
      </div>
    </div>
  );
}