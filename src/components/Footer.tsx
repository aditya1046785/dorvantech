import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <footer className="w-full border-t border-mist bg-surface">
      <div className="w-full h-[16px] pat-hatch" aria-hidden="true" />
      <div className="container pt-[56px] md:pt-[72px] pb-[32px] md:pb-[40px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="inline-block" aria-label="DORVANTECH home">
              <span className="font-display font-bold text-[28px] md:text-[32px] tracking-[0.04em] text-navy">
                DORVANTECH
              </span>
            </Link>
            <p className="t-body mt-4 max-w-[30ch]">
              Technology that works for your business.
            </p>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="link mt-4 t-small">
                {contactEmail}
              </a>
            ) : null}
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <h4 className="t-h4">Explore</h4>
              <nav className="flex flex-col gap-3" aria-label="Explore links">
                <Link href="/#services" className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4">
                  Services
                </Link>
                <Link href="/#partnership" className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4">
                  Approach
                </Link>
                <Link href="/#work" className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4">
                  Work
                </Link>
                <Link href="/#process" className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4">
                  Process
                </Link>
                <Link href="/#faq" className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4">
                  FAQ
                </Link>
                <Link href="/#contact" className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4">
                  Contact
                </Link>
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="t-h4">Work</h4>
              <nav className="flex flex-col gap-3" aria-label="Work links">
                <Link
                  href="/work/nirashray-foundation"
                  className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4"
                >
                  Nirashray Foundation
                </Link>
                <Link
                  href="/work/beats"
                  className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4"
                >
                  BEATS
                </Link>
                <Link
                  href="/work/ai-career-agent"
                  className="t-small text-navy hover:underline decoration-signal decoration-2 underline-offset-4"
                >
                  AI Career Agent
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-[56px] pt-[24px] border-t border-mist flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="t-caption">
            &copy; {currentYear} DORVANTECH. All rights reserved.
          </span>
          <a
            href="https://dorvantech.in"
            className="t-caption text-navy hover:underline decoration-signal decoration-2 underline-offset-4"
          >
            dorvantech.in
          </a>
        </div>
      </div>
    </footer>
  );
}