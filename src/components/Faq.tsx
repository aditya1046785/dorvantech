'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { siteContent, type FaqItem } from '@/content/site';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { items } = siteContent.faq;

  const toggleRow = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col">
      {items.map((item: FaqItem, idx: number) => {
        const isOpen = openIndex === idx;
        const isLast = idx === items.length - 1;

        return (
          <div
            key={item.question}
            className={`border-t border-mist ${isLast ? 'border-b' : ''}`}
          >
            <button
              type="button"
              onClick={() => toggleRow(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              className="w-full min-h-[72px] py-4 flex items-center justify-between gap-4 text-left"
            >
              <h4 className="t-h4 text-navy">{item.question}</h4>
              <span className="w-6 h-6 flex items-center justify-center text-navy shrink-0">
                {isOpen ? <Minus size={24} strokeWidth={1.75} /> : <Plus size={24} strokeWidth={1.75} />}
              </span>
            </button>

            <div
              id={`faq-answer-${idx}`}
              className={`grid transition-[grid-template-rows] duration-280 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="t-body pb-6">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}