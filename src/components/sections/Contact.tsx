import React from 'react';
import { InquiryForm } from '@/components/InquiryForm';
import { siteContent } from '@/content/site';

export function Contact() {
  const { contact } = siteContent;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <section id="contact" className="sec sec-alt">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Context & Sequence */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <h2 className="t-h2">{contact.heading}</h2>
            <p className="t-lead mt-5">{contact.lead}</p>

            <h4 className="t-h4 font-semibold mt-12">What happens next</h4>
            <div className="flex flex-col gap-5 mt-4">
              {contact.steps.map((step, idx) => (
                <div key={step} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full border-[1.5px] border-navy flex items-center justify-center font-display font-semibold text-[15px] shrink-0 text-navy">
                    {idx + 1}
                  </span>
                  <p className="t-body pt-0.5">{step}</p>
                </div>
              ))}
            </div>

            <p className="t-small text-slate mt-10">You will work directly with the founder.</p>

            {contactEmail && (
              <p className="t-small text-slate mt-2">
                Prefer email?{' '}
                <a href={`mailto:${contactEmail}`} className="link">
                  {contactEmail}
                </a>
              </p>
            )}
          </div>

          {/* Right Column: Clean Form */}
          <div className="lg:col-span-7 lg:col-start-7 w-full">
            <InquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}