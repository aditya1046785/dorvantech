'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { Tag } from '@/components/Tag';
import { siteContent, type ServiceItem } from '@/content/site';
import { useInquiryContext } from '@/components/InquiryContext';

export function ServicesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { setSelectedService } = useInquiryContext();
  const services = siteContent.services.items;

  const toggleRow = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleDiscuss = (chipKey: string) => {
    setSelectedService(chipKey);
  };

  return (
    <div className="w-full flex flex-col">
      {services.map((service: ServiceItem, idx: number) => {
        const isOpen = openIndex === idx;
        const isLast = idx === services.length - 1;

        return (
          <div
            key={service.id}
            className={`transition-colors duration-200 ${
              isOpen
                ? 'bg-surface rounded-md border border-mist p-6 md:p-7 my-2 z-10 shadow-none'
                : `hover:bg-surface border-t border-mist ${isLast ? 'border-b' : ''}`
            }`}
          >
            <button
              type="button"
              onClick={() => toggleRow(idx)}
              aria-expanded={isOpen}
              aria-controls={`service-content-${service.id}`}
              className={`w-full min-h-[88px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left ${
                isOpen ? 'min-h-0 pb-4' : 'py-5'
              }`}
            >
              <div>
                <h3 className="t-h3">{service.title}</h3>
                <div className="md:hidden mt-2">
                  <Tag kind={service.tag} />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4 shrink-0">
                <Tag kind={service.tag} />
                <span className="w-6 h-6 flex items-center justify-center text-navy">
                  {isOpen ? <Minus size={24} strokeWidth={1.75} /> : <Plus size={24} strokeWidth={1.75} />}
                </span>
              </div>
              <div className="md:hidden self-end -mt-6">
                <span className="w-6 h-6 flex items-center justify-center text-navy">
                  {isOpen ? <Minus size={24} strokeWidth={1.75} /> : <Plus size={24} strokeWidth={1.75} />}
                </span>
              </div>
            </button>

            <div
              id={`service-content-${service.id}`}
              className={`grid transition-[grid-template-rows] duration-280 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-2">
                  <h4 className="t-h4 font-semibold text-navy">{service.oneLiner}</h4>
                  <p className="t-body mt-3">{service.description}</p>

                  <div className="mt-5">
                    <span className="t-caption font-semibold text-navy block">
                      Typical projects
                    </span>
                    <p className="t-small text-slate mt-1">{service.typicalProjects}</p>
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/#contact"
                      onClick={() => handleDiscuss(service.chipKey)}
                      className="link t-small inline-block"
                    >
                      Discuss this
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}