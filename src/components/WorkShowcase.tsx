'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { SchematicFrame } from '@/components/SchematicFrame';
import { Button } from '@/components/Button';
import { siteContent, type NirashrayTab } from '@/content/site';

export function WorkShowcase() {
  const { nirashray } = siteContent.work;
  const [activeTabId, setActiveTabId] = useState<string>('admin-dashboard');
  const activeTab =
    nirashray.tabs.find((t) => t.id === activeTabId) || nirashray.tabs[2];
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabsCount = nirashray.tabs.length;
    let nextIndex = index;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % tabsCount;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + tabsCount) % tabsCount;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabsCount - 1;
    }

    if (nextIndex !== index) {
      const nextTab = nirashray.tabs[nextIndex];
      setActiveTabId(nextTab.id);
      const targetBtn = tabListRef.current?.querySelector<HTMLButtonElement>(
        `[data-tab-id="${nextTab.id}"]`
      );
      targetBtn?.focus();
    }
  };

  return (
    <div className="bg-sunken border border-mist rounded-xl p-5 md:p-7 lg:p-10">
      {/* Top row */}
      <div className="flex items-center justify-between pb-6 border-b border-mist">
        <span className="bg-surface border border-mist rounded-full t-caption px-3 py-1 text-slate font-medium">
          Flagship project
        </span>
        <a
          href={nirashray.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link hidden md:inline-flex items-center gap-1.5 t-small"
        >
          <span>Visit live site</span>
          <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
        </a>
      </div>

      {/* Main showcase body */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Heading + Tabs */}
        <div className="lg:col-span-5 flex flex-col">
          <h2 className="t-h2 !text-[2.5rem] leading-tight">{nirashray.name}</h2>
          <h3 className="t-h3 mt-3 !font-medium text-navy">{nirashray.positioning}</h3>
          <p className="t-body mt-4">{nirashray.description}</p>

          {/* Desktop Tab List */}
          <div
            ref={tabListRef}
            role="tablist"
            aria-orientation="vertical"
            className="hidden lg:flex flex-col gap-1 mt-6"
          >
            {nirashray.tabs.map((tab: NirashrayTab, idx: number) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTabId(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`px-3.5 py-2.5 rounded-md text-left transition-colors duration-150 ${
                    isActive
                      ? 'bg-signal-tint border-l-[3px] border-signal text-navy'
                      : 'hover:bg-surface text-navy'
                  }`}
                >
                  <span className="t-h4 block leading-tight !text-[1rem]">{tab.label}</span>
                  {isActive && (
                    <span className="t-small text-slate mt-1 block !text-[0.8125rem] leading-snug">
                      {tab.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sticky Preview Frame */}
        <div className="lg:col-span-7 flex flex-col lg:sticky lg:top-[96px]">
          {/* Mobile Tab Strip (Horizontal Scroll) */}
          <div className="flex lg:hidden overflow-x-auto scrollbar-none snap-x snap-mandatory gap-2 pb-4 -mx-2 px-2">
            {nirashray.tabs.map((tab: NirashrayTab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`snap-start whitespace-nowrap h-[44px] px-4 rounded-full text-[14px] font-display font-medium transition-colors shrink-0 ${
                    isActive ? 'bg-navy text-white' : 'bg-surface border border-mist text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Screenshot Frame with Shadow */}
          <div
            id={`panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.id}`}
            className="transition-opacity duration-220"
            style={{
              boxShadow:
                '0 1px 0 #DFE4EA, 0 24px 48px -24px rgba(10, 25, 48, 0.18)',
            }}
          >
            <SchematicFrame
              variant={activeTab.variant}
              imageSrc={activeTab.image}
              alt={activeTab.alt}
              caption={activeTab.label}
            />
          </div>

          <p className="t-caption mt-4 text-slate">{activeTab.label}</p>
          <p className="lg:hidden t-small text-slate mt-2">{activeTab.description}</p>
        </div>
      </div>

      {/* Connected-system strip */}
      <div className="mt-12 bg-surface rounded-md border border-mist p-6">
        <h4 className="t-h4 text-navy">{nirashray.strip.title}</h4>

        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {nirashray.strip.nodes.map((node, i) => {
            const isLast = i === nirashray.strip.nodes.length - 1;
            return (
              <React.Fragment key={node}>
                <div className="rounded-md border border-mist bg-paper px-4 py-3 text-center shrink-0">
                  <span className="t-diagram font-medium">{node}</span>
                </div>
                {!isLast && (
                  <>
                    <div className="hidden md:flex flex-1 items-center px-1" aria-hidden="true">
                      <div className="h-[2px] w-full bg-signal relative">
                        <svg
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[2px]"
                          width="6"
                          height="8"
                          viewBox="0 0 6 8"
                          fill="none"
                        >
                          <path d="M0 0L6 4L0 8V0Z" fill="var(--signal)" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex md:hidden justify-center items-center h-4" aria-hidden="true">
                      <div className="w-[2px] h-full bg-signal relative">
                        <svg
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[2px]"
                          width="8"
                          height="6"
                          viewBox="0 0 8 6"
                          fill="none"
                        >
                          <path d="M0 0L4 6L8 0H0Z" fill="var(--signal)" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <p className="t-small text-slate mt-4">{nirashray.strip.caption}</p>
      </div>

      {/* Footer */}
      <div className="mt-8">
        <Button variant="secondary" href="/work/nirashray-foundation">
          Read the Nirashray case study
        </Button>
      </div>
    </div>
  );
}