import React from 'react';
import { siteContent } from '@/content/site';

export function RequirementsSheet() {
  const { sheetRows } = siteContent.principles;

  return (
    <div className="w-full bg-surface border border-mist rounded-lg overflow-hidden flex flex-col shadow-none">
      <div className="h-[52px] px-5 border-b border-mist flex items-center justify-between shrink-0">
        <h4 className="t-h4">Requirements document</h4>
        <span className="t-caption">Sample structure</span>
      </div>

      <div className="p-6 flex flex-col gap-3.5">
        {sheetRows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span
                className="w-5 h-5 rounded-sm border-[1.5px] border-navy shrink-0 inline-block"
                aria-hidden="true"
              />
              <span className="t-small font-medium text-navy">{row.label}</span>
            </div>
            <div
              className="h-[6px] rounded-full bg-mist ml-8"
              style={{ width: row.barWidth }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <div className="bg-sunken border-t border-mist px-5 py-4">
        <span className="t-caption text-slate block">
          You receive a copy before development begins.
        </span>
      </div>
    </div>
  );
}