import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { WorkShowcase } from '@/components/WorkShowcase';
import { FlowDiagram } from '@/components/FlowDiagram';
import { Button } from '@/components/Button';
import { siteContent } from '@/content/site';

export function Work() {
  const { work } = siteContent;

  return (
    <section id="work" className="sec bg-paper">
      <div className="container">
        <SectionHeading title={work.heading} lead={work.lead} />

        {/* Nirashray Flagship Panel */}
        <div className="mt-16">
          <WorkShowcase />
        </div>

        {/* BEATS & Career Agent Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* BEATS (cols 1-5) */}
          <div className="lg:col-span-5 bg-surface border border-mist rounded-lg p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="t-h3">{work.beats.name}</h3>
              <h4 className="t-h4 font-medium mt-2">{work.beats.positioning}</h4>
              <p className="t-body mt-4">{work.beats.description}</p>
              <FlowDiagram
                nodes={work.beats.flowNodes}
                ariaLabel={`Flow: ${work.beats.flowNodes.join(', then ')}`}
              />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button variant="secondary" href="/work/beats">
                Read the case study
              </Button>
              {work.beats.url && (
                <a
                  href={work.beats.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link inline-flex items-center gap-1.5 t-small"
                >
                  <span>Open the product</span>
                  <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* AI Career Agent (cols 6-12) */}
          <div className="lg:col-span-7 bg-surface border border-mist rounded-lg p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="t-h3">{work.careerAgent.name}</h3>
              <h4 className="t-h4 font-medium mt-2">{work.careerAgent.positioning}</h4>
              <p className="t-body mt-4">{work.careerAgent.description}</p>
              <FlowDiagram
                nodes={work.careerAgent.flowNodes}
                ariaLabel={`Flow: ${work.careerAgent.flowNodes.join(', then ')}`}
              />
            </div>

            <div className="mt-7">
              <Button variant="secondary" href="/work/ai-career-agent">
                Read the case study
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}