import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { InquiryProvider } from '@/components/InquiryContext';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Partnership } from '@/components/sections/Partnership';
import { Work } from '@/components/sections/Work';
import { Process } from '@/components/sections/Process';
import { Audiences } from '@/components/sections/Audiences';
import { Principles } from '@/components/sections/Principles';
import { FaqSection } from '@/components/sections/FaqSection';
import { Contact } from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <InquiryProvider>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <Partnership />
        <Work />
        <Process />
        <Audiences />
        <Principles />
        <FaqSection />
        <Contact />
      </main>
      <Footer />
    </InquiryProvider>
  );
}