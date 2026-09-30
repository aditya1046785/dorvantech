import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { SchematicFrame } from '@/components/SchematicFrame';
import { siteContent, type NirashrayTab } from '@/content/site';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return [
    { slug: 'nirashray-foundation' },
    { slug: 'beats' },
    { slug: 'ai-career-agent' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let title = 'Work';
  if (slug === 'nirashray-foundation') title = siteContent.work.nirashray.name;
  if (slug === 'beats') title = siteContent.work.beats.name;
  if (slug === 'ai-career-agent') title = siteContent.work.careerAgent.name;

  return {
    title: `${title} | DORVANTECH`,
  };
}

export default async function WorkCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;

  if (
    slug !== 'nirashray-foundation' &&
    slug !== 'beats' &&
    slug !== 'ai-career-agent'
  ) {
    notFound();
  }

  const isNirashray = slug === 'nirashray-foundation';
  const isBeats = slug === 'beats';

  const data = isNirashray
    ? siteContent.work.nirashray
    : isBeats
    ? siteContent.work.beats
    : siteContent.work.careerAgent;

  return (
    <>
      <Header />
      <main id="main" className="pt-12 pb-24 bg-paper min-h-screen">
        <div className="container">
          <Link href="/#work" className="link t-small inline-block mb-8">
            Back to all work
          </Link>

          <h1 className="t-h2">{data.name}</h1>
          <h2 className="t-h3 mt-3 text-navy font-medium">{data.positioning}</h2>
          <p className="t-body mt-4 max-w-[62ch]">{data.description}</p>

          {/* Features / Flow section */}
          <div className="mt-16 border-t border-mist pt-10">
            {isNirashray ? (
              <div>
                <h3 className="t-h3">Features</h3>
                <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(data as typeof siteContent.work.nirashray).tabs.map((tab) => (
                    <div key={tab.id} className="flex flex-col">
                      <dt className="t-h4">{tab.label}</dt>
                      <dd className="t-body mt-1 text-slate">{tab.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div>
                <h3 className="t-h3">How it works</h3>
                <ol className="mt-6 flex flex-col gap-3 list-decimal list-inside">
                  {(data as typeof siteContent.work.beats).flowNodes.map((node) => (
                    <li key={node} className="t-body text-navy font-medium">
                      <span className="text-slate font-normal">{node}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Screenshots Grid (Nirashray only until owner adds assets for others) */}
          {isNirashray && (
            <div className="mt-16 border-t border-mist pt-10">
              <h3 className="t-h3">Screenshots</h3>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data as typeof siteContent.work.nirashray).tabs.map((tab: NirashrayTab) => (
                  <div key={tab.id} className="flex flex-col">
                    <SchematicFrame
                      variant={tab.variant}
                      imageSrc={tab.image}
                      alt={tab.alt}
                    />
                    <span className="t-caption mt-2 text-slate">{tab.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Call to Action */}
          <div className="mt-20 border-t border-mist pt-16">
            <h2 className="t-h2">Have an idea? Let&apos;s build it.</h2>
            <div className="mt-6">
              <Button variant="primary" href="/#contact">
                Discuss your project
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}